import json
from json import JSONDecodeError

from server.messages import error, room_list


class Client:
    def __init__(self, server, websocket):
        self.server = server
        self.websocket = websocket

    async def send_room_list(self):
        rooms = self.server.get_room_list()
        await self.send(room_list(rooms))

    async def send(self, message):
        await self.websocket.send(json.dumps(message))

    async def handle_message(self, message):
        try:
            data = json.loads(message)
            isdict = isinstance(data, dict)

            if isdict and 'Login' in data:
                pass
                # await self.send(data['Test'])
            else:
                await self.send(error('Unknown message received'))
        except (JSONDecodeError, TypeError) as e:
            await self.send(error('Can not parse message: {}'.format(e)))
