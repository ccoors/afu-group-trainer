import uuid

from server.exceptions import InvalidRoomNameException


class Room:
    def __init__(self, name, master, password):
        if name.strip() is '':
            raise InvalidRoomNameException('Room name can not be empty')
        self.uuid = uuid.uuid4()
        self.name = name
        self.master = master
        self.members = set()
        self.password = password

    def contains_member(self, member):
        return member in self.members

    def master_is(self, member):
        return member == self.master

    def add_member(self, member):
        self.members.add(member)

    def remove_member(self, member):
        self.members.remove(member)

    def close_room(self):
        pass  # Send remove to all clients


class RoomManager:
    def __init__(self):
        self.rooms = set()

    def get_rooms(self):
        return self.rooms

    def create_room(self, name, master, password=None):
        room = Room(name, master, password)
        self.rooms.add(room)
        return room

    def remove_client(self, member):
        rooms_to_remove = set(filter(lambda r: r.master_is(member), self.rooms))
        for room in rooms_to_remove:
            room.close_room()

        self.rooms.difference_update(rooms_to_remove)

        rooms_to_remove_from = filter(lambda r: r.contains_member(member), self.rooms)
        for room in rooms_to_remove_from:
            room.remove_member(member)
