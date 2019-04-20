import asyncio
import logging

import websockets
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from server.data_types import Base
from server.question_manager import QuestionManager


async def handler(websocket, path):
    if path != '/':
        await websocket.close(404, reason='Not found')

    while True:
        try:
            message = await asyncio.wait_for(websocket.recv(), timeout=1.0)
        except asyncio.TimeoutError:
            message = 'TIMEOUT'
        await websocket.send(message)


class AGTServer:
    def __init__(self, db_url="sqlite:///", port=9120):
        self.db_engine = create_engine(db_url)
        Base.metadata.create_all(self.db_engine)
        self.session_maker = sessionmaker(bind=self.db_engine)
        self.session = self.session_maker()
        self.logger = logging.getLogger(__name__)
        self.question_manager = QuestionManager(self.session)
        self.port = port
        self.logger.info('Initialized AGTServer with {} questions'.format(self.question_manager.count_questions()))

    def run(self):
        self.logger.info('Starting AGTServer...'.format(self.question_manager.count_questions()))
        return websockets.serve(handler, '0.0.0.0', self.port)

    def shutdown(self):
        self.session.close()
