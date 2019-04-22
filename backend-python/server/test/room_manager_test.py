import unittest

from server.room_manager import RoomManager


class RoomManagerTests(unittest.TestCase):
    def setUp(self):
        self.room_manager = RoomManager()

    def test_create_room(self):
        self.assertEqual(len(self.room_manager.get_rooms()), 0)
        room = self.room_manager.create_room('abc', 'master')
        rooms = self.room_manager.get_rooms()
        self.assertEqual(len(rooms), 1)
        self.assertIn(room, rooms)

    def test_master(self):
        room = self.room_manager.create_room('abc', 'master')
        self.assertTrue(room.master_is('master'))
        self.room_manager.remove_client('master')
        rooms = self.room_manager.get_rooms()
        self.assertEqual(len(rooms), 0)


if __name__ == '__main__':
    unittest.main()
