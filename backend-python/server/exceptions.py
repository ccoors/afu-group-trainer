class AGTException(Exception):
    pass


class InvalidRoomNameException(AGTException):
    pass


class OperationFailedException(AGTException):
    pass


class NotAuthenticatedException(AGTException):
    pass
