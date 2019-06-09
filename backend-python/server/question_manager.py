import logging

from server.data_types import Question, QuestionCategory, Answer


def question_hook(param):
    if 'question' in param:
        question_id = param['id']
        question = param['question']
        outdated = param['outdated']
        answers = param['answers']
        add_answers = []
        for i in range(0, 4):
            add_answers.append(Answer(answers[i], i == 0))
        return Question(question_id, question, outdated, add_answers)
    else:
        question_id = param['id']
        name = param['name']
        prefix = param['prefix']
        children = param['children']
        questions = param['questions']
        return QuestionCategory(question_id, name, prefix, children, questions)


class QuestionManager:
    def __init__(self, session):
        self.logger = logging.getLogger(__name__)
        self.session = session

    def count_questions(self):
        return self.session.query(Question).count()

    def get_database(self):
        return self.session.query(QuestionCategory).filter_by(category_id='__ROOT__').first()
