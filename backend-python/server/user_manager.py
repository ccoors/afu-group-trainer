import logging

from server.data_types import User


class UserManager:
    def __init__(self, session, settings):
        self.logger = logging.getLogger(__name__)
        self.session = session

        default_root_password = settings.get('default_root_password', 'root')
        if self.get_user('root') is None:
            self.logger.info('Creating default user "root" with the specified default password...')
            self.create_user('root', default_root_password)

    def create_user(self, name, password):
        self.logger.info(f'Creating user "{name}"...')
        user = User(name, password)
        self.session.add(user)
        self.session.commit()

    def get_user(self, name):
        return self.session.query(User).filter_by(name=name).first()
