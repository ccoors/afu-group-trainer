import json
import logging
from json import JSONDecodeError

from server.exceptions import OperationFailedException, NotAuthenticatedException, InvalidRoomNameException
from server.messages import error, room_list, login_result, question_database, create_room_result


class Client:
    def __init__(self, server, websocket):
        self.logger = logging.getLogger(__name__)
        self.server = server
        self.websocket = websocket
        self.user = None
        self.room = None
        self.handle_actions = [
            {'message': 'Login', 'require_dict': True, 'require_auth': False, 'action': self.login},
            {'message': 'CreateRoom', 'require_dict': True, 'require_auth': True, 'action': self.create_room}
        ]

    async def send_room_list(self):
        rooms = self.server.get_room_list()
        await self.send(room_list(rooms))

    async def send(self, message):
        await self.websocket.send(json.dumps(message))

    async def login(self, data):
        if self.user:
            raise OperationFailedException('User already logged in')
        login = data['Login']
        self.user = self.server.login(login['username'], login['password'])
        if self.user:
            await self.send(login_result(True))
            question_db = self.server.get_question_database()
            await self.send(question_database(question_db))
        else:
            await self.send(login_result(False))

    async def create_room(self, data):
        if self.room:
            raise OperationFailedException('Already in a room')
        crate_room = data['CreateRoom']
        room_name = crate_room['room_name']
        password = crate_room['password']
        try:
            self.room = self.server.create_room(self, room_name, password)
            await self.send(create_room_result(True, str(self.room.uuid)))
        except InvalidRoomNameException:
            await self.send(create_room_result(False, ''))

    async def handle_message(self, message):
        try:
            data = json.loads(message)
            isdict = isinstance(data, dict)
            operation_done = False

            try:
                for action in self.handle_actions:
                    if action['message'] in data:
                        if action['require_dict'] and not isdict:
                            raise OperationFailedException('Expected an object')
                        if action['require_auth'] and not self.user:
                            raise NotAuthenticatedException('You are not authorized to do this')
                        await action['action'](data)
                        operation_done = True
            except OperationFailedException as e:
                self.logger.error('Operating failed during message: %s', e)
                await self.send(error('Operation failed: {}'.format(e)))
                operation_done = True
            except NotAuthenticatedException as e:
                self.logger.error('Authorization required for message: %s', e)
                await self.send(error('Authorization error: {}'.format(e)))
                operation_done = True
            except Exception as e:
                self.logger.error('Exception: %s', e)
                await self.send(error('Exception: {}'.format(e)))
                operation_done = True

            if not operation_done:
                self.logger.error('Unknown message received: %s', message)
                await self.send(error('Unknown message received'))
        except (JSONDecodeError, TypeError) as e:
            self.logger.error('Can not parse message: %s', message)
            await self.send(error('Can not parse message: {}'.format(e)))
