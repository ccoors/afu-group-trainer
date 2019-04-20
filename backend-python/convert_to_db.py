import json

from server.data_types import Base, QuestionCategory
from server.question_manager import question_hook

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


def add_to_db(session, category):
    for child in category.children:
        add_to_db(session, child)

    if category.name:
        session.add(category)
    session.add_all(category.questions)


def add_json(root, file):
    with open(file) as f:
        category = json.load(f, object_hook=question_hook)
        for child in category.children:
            child.set_parent(root)
            child.update_parents()

    print(len(category.children))
    print(len(root.children))
    root.add_children(category.children)
    print(len(root.children))


if __name__ == "__main__":
    engine = create_engine('sqlite:///database.sqlite', echo=True)
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

    Session = sessionmaker(bind=engine)
    session = Session()

    root = QuestionCategory("__ROOT__")
    add_json(root, '../backend/assets/TechnikE.json')
    add_json(root, '../backend/assets/BetriebstechnikVorschriften.json')

    add_to_db(session, root)

    session.commit()
    session.close()

