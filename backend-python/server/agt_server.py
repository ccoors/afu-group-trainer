import asyncio
import functools
import logging

import websockets
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from server.client import Client
from server.data_types import Base
from server.messages import keep_alive
from server.question_manager import QuestionManager
from server.room_manager import RoomManager
from server.user_manager import UserManager

AGT_SETTINGS_NAMESPACE = "AGT Backend"
WEBSOCKET_SETTINGS_NAMESPACE = "WebSocket"


async def handler(websocket, path, server):
    client = Client(server, websocket)
    try:
        server.add_client(client)
        settings = server.config[AGT_SETTINGS_NAMESPACE]
        websocket_settings = server.config[WEBSOCKET_SETTINGS_NAMESPACE]

        socket_path = websocket_settings.get('path', '/')
        if path != socket_path:
            await websocket.close(404, reason='Not found')

        await client.send_room_list()

        ping_test = float(settings['ping_test'])

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
                await client.send(keep_alive(2 * 1000 * ping_test))
            elif message_wait in done:
                message = message_wait.result()
                message_wait = None
                await client.handle_message(message)
    except websockets.ConnectionClosed:
        pass
    except Exception as e:
        server.logger.error(e)
    finally:
        server.remove_client(client)


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
        self.room_manager = RoomManager()
        self.user_manager = UserManager(self.session, self.config[AGT_SETTINGS_NAMESPACE])
        self.websocket_options = {
            'host': self.config[WEBSOCKET_SETTINGS_NAMESPACE]['host'],
            'port': int(self.config[WEBSOCKET_SETTINGS_NAMESPACE]['port']),
        }
        self.clients = set()
        self._qm_cache = None
        self.logger.info('Initialized AGTServer with {} questions'.format(self.question_manager.count_questions()))

    def run(self):
        self.logger.info('Starting AGTServer...'.format(self.question_manager.count_questions()))
        bound_handler = functools.partial(handler, server=self)
        return websockets.serve(bound_handler, **self.websocket_options)

    def add_client(self, websocket):
        self.clients.add(websocket)

    def remove_client(self, client):
        self.room_manager.remove_client(client)
        self.clients.remove(client)

    def login(self, username, password):
        user = self.user_manager.get_user(username)
        if user:
            authenticated = user.check_password(password)
            if authenticated:
                return user

    def create_room(self, client, room_name, password):
        return self.room_manager.create_room(room_name, client, password)

    @staticmethod
    def _map_room_to_list(room):
        return {
            'uuid': str(room.uuid),
            'name': room.name,
            'users': len(room.members),
            'password_requried': room.password is not None
        }

    def get_room_list(self):
        room_objects = self.room_manager.get_rooms()
        rooms = list(map(self._map_room_to_list, room_objects))
        rooms.sort(key=lambda r: r['name'])
        return rooms

    def get_question_database(self):
        if self._qm_cache:
            return self._qm_cache
        self._qm_cache = self.question_manager.get_database().serializable()
        return self._qm_cache

    async def broadcast(self, message):
        if self.clients:
            await asyncio.wait([user.send(message) for user in self.clients])

    def shutdown(self):
        self.logger.info('Closing database connection...')
        self.session.close()
