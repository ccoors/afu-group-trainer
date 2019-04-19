import uuid

NAMESPACE_UUID = uuid.UUID("9aefc690-e51b-49da-ae6a-8e7179d4d6ef")


def gen_uuid(*names):
    name = ''.join(map(lambda n: str(n), names))
    return str(uuid.uuid5(NAMESPACE_UUID, name))
