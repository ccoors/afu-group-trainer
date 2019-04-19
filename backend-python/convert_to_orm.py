import json

from server.data_types import Base
from server.question_manager import question_hook

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


def add_to_db(session, category):
    for child in category.children:
        add_to_db(session, child)

    if category.name:
        session.add(category)
    session.add_all(category.questions)


def add_json(session, file):
    with open(file) as f:
        category = json.load(f, object_hook=question_hook)

    add_to_db(session, category)


if __name__ == "__main__":
    engine = create_engine('sqlite:///orm.sqlite', echo=True)
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

    Session = sessionmaker(bind=engine)
    session = Session()

    add_json(session, '../backend/assets/TechnikE.json')
    add_json(session, '../backend/assets/BetriebstechnikVorschriften.json')

    session.commit()

