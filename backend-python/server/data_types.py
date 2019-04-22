import bcrypt
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref

from server.util import gen_uuid

Base = declarative_base()


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

    def serializable(self):
        return dict({
            'uuid': self.uuid(),
            'id': self.category_id,
            'name': self.name,
            'prefix': self.prefix,
            'children': list(map(lambda c: c.serializable(), self.children)),
            'questions': list(map(lambda q: q.serializable(), self.questions))
        })

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
    outdated = Column(Boolean)

    category = relationship("QuestionCategory", back_populates="questions")
    category_id = Column(Integer, ForeignKey('categories.category_id'))

    def __init__(self, question_id, question, outdated, answers):
        self.question_id = question_id
        self.question = question
        self.answers = answers
        self.outdated = outdated

    def __repr__(self):
        return "Question(uuid={}, id={}, question_id={}, outdated={}, question={}, category_id={})".format(self.uuid(),
                                                                                                           self.id,
                                                                                                           self.question_id,
                                                                                                           self.outdated,
                                                                                                           self.question,
                                                                                                           self.category_id)

    def uuid(self):
        return gen_uuid(self.question_id, self.question, self.category_id)

    def serializable(self):
        return dict({
            'uuid': self.uuid(),
            'id': self.question_id,
            'question': self.question,
            'outdated': self.outdated,
            'answers': list(map(lambda a: a.text, self.answers))
        })


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
