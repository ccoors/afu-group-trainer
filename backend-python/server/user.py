import logging

import bcrypt
from sqlalchemy import Column, Integer, String

from server.data_types import Base


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    password_hash = Column(String)

    def __init__(self, name, password):
        self.name = name
        self.password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

    def check_password(self, password):
        return bcrypt.checkpw(password.encode(), self.password_hash)


class UserManager:
    def __init__(self, session, settings):
        self.logger = logging.getLogger(__name__)
        self.session = session

        default_root_password = settings.get('default_root_password', 'root')
        if self.get_user('root') is None:
            self.logger.info('Creating default user "root" with the specified default password...')
            user = User('root', default_root_password)
            self.session.add(user)
            self.session.commit()

    def get_user(self, name):
        return self.session.query(User).filter_by(name=name).first()
