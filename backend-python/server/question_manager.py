import json
import copy
import logging


class Question:
    def __init__(self, uuid, question_id, question, answers):
        self.uuid = uuid
        self.id = question_id
        self.question = question
        self.answers = answers


class QuestionCategory:
    def __init__(self, uuid='', category_id='', name='', prefix='', children=None, questions=None):
        if children is None:
            children = []
        if questions is None:
            questions = []
        self.uuid = uuid
        self.id = category_id
        self.name = name
        self.prefix = prefix
        self.children = children
        self.questions = questions

    def add_children(self, children):
        self.children.extend(children)

    def count_questions(self):
        return len(self.questions) + sum(map(lambda c: c.count_questions(), self.children))


def question_hook(param):
    if 'question' in param:
        uuid = param['uuid']
        question_id = param['id']
        question = param['question']
        answers = param['answers']
        return Question(uuid, question_id, question, answers)
    else:
        uuid = param['uuid']
        question_id = param['id']
        name = param['name']
        prefix = param['prefix']
        children = param['children']
        questions = param['questions']
        return QuestionCategory(uuid, question_id, name, prefix, children, questions)


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
