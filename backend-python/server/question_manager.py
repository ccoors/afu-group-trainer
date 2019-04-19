import json
import copy
import logging

from server.data_types import Question, QuestionCategory, Answer


def question_hook(param):
    if 'question' in param:
        # uuid = param['uuid']
        question_id = param['id']
        question = param['question']
        answers = param['answers']
        add_answers = []
        for i in range(0, 4):
            add_answers.append(Answer(answers[i], i == 0, question_id))
        return Question(question_id, question, add_answers)
    else:
        # uuid = param['uuid']
        question_id = param['id']
        name = param['name']
        prefix = param['prefix']
        children = param['children']
        questions = param['questions']
        return QuestionCategory(question_id, name, prefix, children, questions)


class QuestionManager:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.database = QuestionCategory()

    def load_questions(self, file):
        self.logger.info("Loading question file '{}'".format(file))
        with open(file) as f:
            data = json.load(f, object_hook=question_hook)

        self.database.add_children(data.children)

    def count_questions(self):
        return self.database.count_questions()

    def get_database(self):
        return copy.deepcopy(self.database)
