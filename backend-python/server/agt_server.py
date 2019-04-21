import asyncio
import functools
import logging

import websockets
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from server.data_types import Base
from server.question_manager import QuestionManager

AGT_SETTINGS_NAMESPACE = "AGT Backend"
WEBSOCKET_SETTINGS_NAMESPACE = "WebSocket"


async def handler(websocket, path, props):
    settings = props['server'].config[AGT_SETTINGS_NAMESPACE]
    websocket_settings = props['server'].config[WEBSOCKET_SETTINGS_NAMESPACE]

    socket_path = websocket_settings.get('path', '/')
    if path != socket_path:
        await websocket.close(404, reason='Not found')

    ping_test = float(settings['ping_test'])

    ping_wait = None
    message_wait = None
    while True:
        if ping_wait is None:
            ping_wait = asyncio.create_task(asyncio.sleep(ping_test))
        if message_wait is None:
            message_wait = asyncio.create_task(websocket.recv())
        done, pending = await asyncio.wait({ping_wait, message_wait}, return_when=asyncio.FIRST_COMPLETED)

        if ping_wait in done:
            ping_wait = None
            message = 'TIMEOUT {}'.format(settings['ping_test'])
            await websocket.send(message)
        elif message_wait in done:
            message_wait = None
            message = 'Message received {}, {}'.format(done, pending)
            await websocket.send(message)


class AGTServer:
    def __init__(self, config):
        self.logger = logging.getLogger(__name__)
        self.config = config
        database = self.config[AGT_SETTINGS_NAMESPACE].get('database', 'sqlite:///')
        self.logger.info("Using database {}".format(database))
        self.db_engine = create_engine(database)
        Base.metadata.create_all(self.db_engine)
        self.session_maker = sessionmaker(bind=self.db_engine)
        self.session = self.session_maker()
        self.question_manager = QuestionManager(self.session)
        self.websocket_options = {
            'host': self.config[WEBSOCKET_SETTINGS_NAMESPACE]['host'],
            'port': int(self.config[WEBSOCKET_SETTINGS_NAMESPACE]['port']),
        }
        self.logger.info('Initialized AGTServer with {} questions'.format(self.question_manager.count_questions()))

    def run(self):
        self.logger.info('Starting AGTServer...'.format(self.question_manager.count_questions()))
        props = {
            'server': self
        }
        bound_handler = functools.partial(handler, props=props)
        return websockets.serve(bound_handler, **self.websocket_options)

    def shutdown(self):
        self.session.close()
