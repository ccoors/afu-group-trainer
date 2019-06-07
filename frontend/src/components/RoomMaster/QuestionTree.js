import React from 'react';
import PropTypes from 'prop-types';

import {Button, Header, Input, Tab} from "semantic-ui-react";

import {ltrim} from "../../util/util";
import QuestionListRenderer from "../LoggedIn/QuestionListRenderer";

class QuestionTree extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchInput: "",
        };
    }

    static getCategorySuffix(category) {
        if (category.prefix && category.questions.length !== 0) {
            return <p>Fragenprefix {category.prefix}, {category.questions.length} Fragen</p>;
        } else if (category.prefix && category.questions.length === 0) {
            return <p>Fragenprefix {category.prefix}</p>;
        } else if (category.questions.length !== 0) {
            return <p>{category.questions.length} Fragen</p>;
        } else {
            return "";
        }
    }

    renderDatabaseTree(category) {
        if (category.name === "") {
            return category.children.map(c => this.renderDatabaseTree(c));
        }
        let childrenTree = category.children.map(c => this.renderDatabaseTree(c));

        let suffix = QuestionTree.getCategorySuffix(category);

        return <li key={"deep_" + category.uuid}>
            <p className="linkButton"
               onClick={() => this.props.goToSettings(category.uuid, false)}>{category.name}</p>
            {suffix}
            {childrenTree.length > 0 && <ul>{childrenTree}</ul>}
        </li>;
    }

    renderDatabaseNormal() {
        return <ul key="rootNode" className="questionTree">
            {this.props.appState.questionDatabase.children.map(c => this.renderDatabaseTree(c))}
        </ul>;
    }

    searchDatabaseInternally(category) {
        if (category.name === "") {
            return category.children.map(c => this.searchDatabaseInternally(c)).reduce((l, r) => l.concat(r), []);
        }

        let jsx = null;
        if (category.name.toLowerCase().includes(this.state.searchInput)) {
            let suffix = QuestionTree.getCategorySuffix(category);
            jsx = <li key={"flat_" + category.uuid}>
                <p className="linkButton"
                   onClick={() => this.props.goToSettings(category.uuid, false)}>{category.name}</p>
                {suffix}</li>;
        }
        let next = category.children.map(c => this.searchDatabaseInternally(c)).reduce((l, r) => l.concat(r), []);
        if (jsx) {
            next = [jsx].concat(next);
        }
        return next;
    }

    searchDatabase() {
        let databaseResults = this.searchDatabaseInternally(this.props.appState.questionDatabase);
        if (databaseResults.length === 0) {
            return null;
        } else {
            return <ul key="searchDB">{databaseResults}</ul>;
        }
    }

    searchQuestionsInternally(category) {
        let matchingQuestions = category.questions.filter(q => {
            return q.question.toLowerCase().includes(this.state.searchInput)
                || q.id.toLowerCase().includes(this.state.searchInput)
                || q.answers.filter(a => a.toLowerCase().includes(this.state.searchInput)).length > 0;
        }).map(q => {
            return <li key={"question_" + q.uuid}>
                <p className="linkButton"
                   onClick={() => {
                       this.props.quickStartQuestions(q.uuid);
                   }}>{q.id}: {q.question}</p>
            </li>;
        });

        return matchingQuestions.concat(category.children.map(c => this.searchQuestionsInternally(c)).reduce((l, r) => l.concat(r), []));
    }

    searchQuestions() {
        let databaseResults = this.searchQuestionsInternally(this.props.appState.questionDatabase);
        if (databaseResults.length === 0) {
            return null;
        } else {
            return <ul key="searchQ">{databaseResults}</ul>;
        }
    }

    setSearchInput(input) {
        this.setState({
            searchInput: ltrim(input.target.value.toLowerCase()),
        })
    }

    render() {
        const tabPanes = [
            {
                menuItem: {key: 'catalog', icon: 'book', content: 'Fragenkataloge'},
                render: () => {
                    const databaseRendered = this.state.searchInput.length < 2 ?
                        this.renderDatabaseNormal() :
                        [<Header as="h2" key="header_cat">Kategorien</Header>, this.searchDatabase(),
                            <Header as="h2" key="header_quest">Fragen</Header>, this.searchQuestions()];
                    return <Tab.Pane>
                        <Input fluid placeholder="Frage oder Kategorie" icon="search"
                               onChange={this.setSearchInput.bind(this)} value={this.state.searchInput}
                               style={{marginTop: "0.4em"}}/>
                        {databaseRendered}
                    </Tab.Pane>;
                }
            },
            {
                menuItem: {key: 'lists', icon: 'list', content: 'Fragenlisten'},
                render: () => <Tab.Pane>
                    <Header as="h2" content="Meine Fragenlisten"/>
                    <QuestionListRenderer questionList={this.props.appState.myQuestionLists}
                                          questionDatabase={this.props.appState.questionDatabase}
                                          actionHandler={this.props.appState.actionHandler}
                                          publicLists={false} allowEdit={true}
                                          startQuestions={this.props.quickStartQuestions}/>

                    <Header as="h2" content="Öffentliche Fragelisten"/>
                    <QuestionListRenderer questionList={this.props.appState.publicQuestionLists}
                                          questionDatabase={this.props.appState.questionDatabase}
                                          startQuestions={this.props.quickStartQuestions}/>
                </Tab.Pane>
            },
            {
                menuItem: {key: 'special', icon: 'star', content: 'Sonderfunktionen'},
                render: () => <Tab.Pane>
                    <Button color={this.props.color} size="small" onClick={() => this.props.quickStartQuestions("")}>
                        <Button.Content visible>Leere ABCD-Fragen stellen</Button.Content>
                    </Button>
                </Tab.Pane>
            }
        ];

        return <div>
            <Tab panes={tabPanes}/>
        </div>;
    }
}

QuestionTree.propTypes = {
    appState: PropTypes.object.isRequired,
    quickStartQuestions: PropTypes.func.isRequired,
    goToSettings: PropTypes.func.isRequired,
    color: PropTypes.string.isRequired,
};

export default QuestionTree;
