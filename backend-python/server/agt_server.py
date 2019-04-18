import asyncio
import logging
import websockets
import sqlalchemy

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
    def __init__(self, questions=None, port=9120):
        if questions is None:
            questions = []
        self.logger = logging.getLogger(__name__)
        self.question_manager = QuestionManager()
        self.port = port
        for question_file in questions:
            self.question_manager.load_questions(question_file)

        self.logger.info('Initialized AGTServer with {} questions'.format(self.question_manager.count_questions()))

    def run(self):
        self.logger.info('Starting AGTServer...'.format(self.question_manager.count_questions()))
        return websockets.serve(handler, '0.0.0.0', self.port)
