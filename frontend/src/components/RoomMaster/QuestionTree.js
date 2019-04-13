import React from 'react';
import PropTypes from 'prop-types';

import {Header, Input} from "semantic-ui-react";

import {ltrim} from "../../util/util";

class QuestionTree extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchInput: "",
        };
    }

    static getCategorySuffix(category) {
        if (category.prefix !== "" && category.questions.length !== 0) {
            return <p>Fragenprefix {category.prefix}, {category.questions.length} Fragen</p>;
        } else if (category.prefix !== "" && category.questions.length === 0) {
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
        return <ul key="rootNode">
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
        let databaseRendered = this.state.searchInput.length < 2 ?
            this.renderDatabaseNormal() :
            [<Header as="h2" key="header_cat">Kategorien</Header>, this.searchDatabase(),
                <Header as="h2" key="header_quest">Fragen</Header>, this.searchQuestions()];

        return <div>
            <Input fluid placeholder="Frage oder Kategorie" icon="search"
                   onChange={this.setSearchInput.bind(this)} value={this.state.searchInput}
                   style={{marginTop: "0.4em"}}/>
            {databaseRendered}
        </div>;
    }
}

QuestionTree.propTypes = {
    appState: PropTypes.object.isRequired,
    quickStartQuestions: PropTypes.func.isRequired,
    goToSettings: PropTypes.func.isRequired,
};

export default QuestionTree;
