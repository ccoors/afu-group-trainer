import json

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from server.data_types import StaticBase
from server.question_manager import question_hook


def add_to_db(session, category):
    for child in category.children:
        add_to_db(session, child)

    if category.name:
        session.add(category)
    session.add_all(category.questions)


def read_json(file):
    with open(file) as f:
        category = json.load(f, object_hook=question_hook)

    return category


if __name__ == "__main__":
    engine = create_engine('sqlite:///questions.sqlite', echo=True)
    StaticBase.metadata.drop_all(engine)
    StaticBase.metadata.create_all(engine)

    Session = sessionmaker(bind=engine)
    session = Session()

    root = read_json('../backend/assets/Fragenkatalog.json')
    root.name = '__ROOT__'

    add_to_db(session, root)

    session.commit()
    session.close()
