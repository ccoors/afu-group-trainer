def room_list(new_list):
    return {
        'RoomList': new_list
    }


def login_result(success):
    return {
        'LoginResult': success
    }


def join_room_result(success):
    return {
        'JoinRoomResult': success
    }


def create_room_result(success, uuid):
    return {
        'CreateRoomResult': {
            'success': success,
            'uuid': uuid
        }
    }


def error(error_message):
    return {
        'Error': {
            'message': error_message
        }
    }


def keep_alive(next_message):
    return {
        'KeepAlive': {
            'next': next_message
        }
    }
