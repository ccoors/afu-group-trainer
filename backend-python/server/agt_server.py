import asyncio
import functools
import json
import logging
from json import JSONDecodeError

import websockets
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from server.data_types import Base
from server.messages import keep_alive, error
from server.question_manager import QuestionManager

AGT_SETTINGS_NAMESPACE = "AGT Backend"
WEBSOCKET_SETTINGS_NAMESPACE = "WebSocket"


async def send_message(websocket, message):
    serialized_message = json.dumps(message)
    await websocket.send(serialized_message)


class Client:
    def __init__(self, props, websocket):
        self.props = props
        self.websocket = websocket

    async def send(self, message):
        await self.websocket.send(json.dumps(message))

    async def handle_message(self, message):
        try:
            data = json.loads(message)
        except (JSONDecodeError, TypeError):
            await self.send(error('Can not parse message'))


async def handler(websocket, path, props):
    server = props['server']
    try:
        settings = server.config[AGT_SETTINGS_NAMESPACE]
        websocket_settings = server.config[WEBSOCKET_SETTINGS_NAMESPACE]

        socket_path = websocket_settings.get('path', '/')
        if path != socket_path:
            await websocket.close(404, reason='Not found')

        ping_test = float(settings['ping_test'])

        server.add_user(websocket)
        client = Client(props, websocket)
        ping_wait = None
        message_wait = None
        while True:
            if ping_wait is None:
                ping_wait = asyncio.create_task(asyncio.sleep(ping_test))
            if message_wait is None:
                message_wait = asyncio.create_task(websocket.recv())
            done, pending = await asyncio.wait({ping_wait, message_wait}, return_when=asyncio.FIRST_COMPLETED)
            for d in done:
                if d.exception():
                    raise d.exception()

            if ping_wait in done:
                ping_wait = None
                await send_message(websocket, keep_alive(2 * 1000 * ping_test))
            elif message_wait in done:
                message = message_wait.result()
                message_wait = None
                await client.handle_message(message)
    except websockets.ConnectionClosed:
        pass
    except Exception as e:
        server.logger.error(e)
    finally:
        server.remove_user(websocket)


class AGTServer:
    def __init__(self, config):
        self.logger = logging.getLogger(__name__)
        self.config = config
        database = self.config[AGT_SETTINGS_NAMESPACE].get('database', 'sqlite:///')
        self.logger.info('Using database {}'.format(database))
        self.db_engine = create_engine(database)
        Base.metadata.create_all(self.db_engine)
        self.session_maker = sessionmaker(bind=self.db_engine)
        self.session = self.session_maker()
        self.question_manager = QuestionManager(self.session)
        self.websocket_options = {
            'host': self.config[WEBSOCKET_SETTINGS_NAMESPACE]['host'],
            'port': int(self.config[WEBSOCKET_SETTINGS_NAMESPACE]['port']),
        }
        self.users = set()
        self.logger.info('Initialized AGTServer with {} questions'.format(self.question_manager.count_questions()))

    def run(self):
        self.logger.info('Starting AGTServer...'.format(self.question_manager.count_questions()))
        props = {
            'server': self
        }
        bound_handler = functools.partial(handler, props=props)
        return websockets.serve(bound_handler, **self.websocket_options)

    def add_user(self, websocket):
        self.users.add(websocket)

    def remove_user(self, websocket):
        self.users.remove(websocket)

    async def broadcast(self, message):
        if self.users:
            await asyncio.wait([user.send(message) for user in self.users])

    def shutdown(self):
        self.logger.info('Closing database connection...')
        self.session.close()
