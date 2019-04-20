from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref

from server.util import gen_uuid

Base = declarative_base()


class QuestionCategory(Base):
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True)
    category_id = Column(String, unique=True)
    name = Column(String)
    prefix = Column(String)

    parent_id = Column(Integer, ForeignKey('categories.id'))
    children = relationship("QuestionCategory", cascade="all, delete-orphan", backref=backref("parent", remote_side=id))

    def __init__(self, category_id='', name='', prefix='', children=None, questions=None, parent=None):
        if children is None:
            children = []
        if questions is None:
            questions = []
        self.category_id = category_id
        self.name = name
        self.prefix = prefix
        self.children = children
        self.questions = questions
        self.parent = parent

    def __repr__(self):
        return "QuestionCategory(uuid={}, id={}, category_id={}, name={}, prefix={}, parent_id={})".format(self.uuid(),
                                                                                                           self.id,
                                                                                                           self.category_id,
                                                                                                           self.name,
                                                                                                           self.prefix,
                                                                                                           self.parent_id)

    def uuid(self):
        return gen_uuid(self.category_id, self.name, self.prefix, self.parent_id)

    def add_children(self, children):
        self.children.extend(children)

    def set_parent(self, parent):
        self.parent = parent

    def update_parents(self):
        for child in self.children:
            child.set_parent(self)
            child.update_parents()

    def count_questions(self):
        return len(self.questions) + sum(map(lambda c: c.count_questions(), self.children))


class Question(Base):
    __tablename__ = 'questions'
    id = Column(Integer, primary_key=True)
    question_id = Column(String)
    question = Column(String)

    category = relationship("QuestionCategory", back_populates="questions")
    category_id = Column(Integer, ForeignKey('categories.category_id'))

    def __init__(self, question_id, question, answers):
        self.question_id = question_id
        self.question = question
        self.answers = answers

    def __repr__(self):
        return "Question(uuid={}, id={}, question_id={}, question={}, category_id={})".format(self.uuid(), self.id,
                                                                                              self.question_id,
                                                                                              self.question,
                                                                                              self.category_id)

    def uuid(self):
        return gen_uuid(self.question_id, self.question, self.category_id)


class Answer(Base):
    __tablename__ = "answers"
    id = Column(Integer, primary_key=True)
    correct = Column(Boolean)
    text = Column(String)
    question = relationship("Question", back_populates="answers")
    question_id = Column(Integer, ForeignKey('questions.id'))

    def __init__(self, text, correct):
        self.text = text
        self.correct = correct

    def __repr__(self):
        return "Answer(uuid={}, id={}, correct={}, text={}, question_id={})".format(self.uuid(), self.id, self.correct,
                                                                                    self.text, self.question_id)

    def uuid(self):
        return gen_uuid(self.correct, self.text, self.question_id)


QuestionCategory.questions = relationship("Question", order_by=Question.id, back_populates="category",
                                          cascade="all, delete-orphan")
Question.answers = relationship("Answer", order_by=Answer.id, back_populates="question",
                                cascade="all, delete-orphan")
