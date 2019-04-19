from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from server.util import gen_uuid

Base = declarative_base()


class QuestionCategory(Base):
    __tablename__ = 'categories'
    id = Column(String, primary_key=True)
    category_id = Column(String)
    name = Column(String)
    prefix = Column(String)
    children = relationship("QuestionCategory", back_populates="children")
    # parent_id = Column(Integer, ForeignKey('categories.category_id'))

    def __init__(self, category_id='', name='', prefix='', children=None, questions=None):
        if children is None:
            children = []
        if questions is None:
            questions = []
        self.id = gen_uuid(category_id, name, prefix, children, questions)
        self.category_id = category_id
        self.name = name
        self.prefix = prefix
        # self.children = children
        # self.questions = questions

    def add_children(self, children):
        self.children.extend(children)

    def count_questions(self):
        return len(self.questions) + sum(map(lambda c: c.count_questions(), self.children))


class Question(Base):
    __tablename__ = 'questions'
    id = Column(String, primary_key=True)
    question_id = Column(String)
    question = Column(String)

    category = relationship("QuestionCategory", back_populates="questions")
    category_id = Column(Integer, ForeignKey('categories.category_id'))

    def __init__(self, question_id, question, answers):
        self.id = gen_uuid(question_id, question, answers)
        self.question_id = question_id
        self.question = question
        self.answers = answers


class Answer(Base):
    __tablename__ = "answers"
    id = Column(String, primary_key=True)
    correct = Column(Boolean)
    text = Column(String)
    question = relationship("Question", back_populates="answers")
    question_id = Column(Integer, ForeignKey('questions.id'))

    def __init__(self, text, correct, parent_id):
        self.text = text
        self.correct = correct
        self.id = gen_uuid(text, correct, parent_id)


QuestionCategory.questions = relationship("Question", order_by=Question.id, back_populates="category")
Question.answers = relationship("Answer", order_by=Answer.id, back_populates="question")
