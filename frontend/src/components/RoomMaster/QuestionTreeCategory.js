import React from 'react';
import PropTypes from 'prop-types';
import {Header, Input} from "semantic-ui-react";
import {ltrim} from "../../util/util";

class QuestionTreeCategory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchInput: ''
        };

        this.setSearchInput = this.setSearchInput.bind(this);
        this.renderDatabaseTree = this.renderDatabaseTree.bind(this);
        this.searchDatabaseInternally = this.searchDatabaseInternally.bind(this);
        this.searchQuestionsInternally = this.searchQuestionsInternally.bind(this);
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

    setSearchInput(input) {
        this.setState({
            searchInput: ltrim(input.target.value.toLowerCase())
        });
    }

    renderDatabaseTree(category) {
        const childrenTree = category.children.map(c => this.renderDatabaseTree(c));
        if (!category.name) {
            return childrenTree;
        }

        const suffix = QuestionTreeCategory.getCategorySuffix(category);

        return <li key={"deep_" + category.uuid}>
            <p className="linkButton"
               onClick={() => this.props.goToSettings(category.uuid, false)}>{category.name}</p>
            {suffix}
            {childrenTree.length > 0 && <ul>{childrenTree}</ul>}
        </li>;
    }

    searchDatabaseInternally(category, searchInput) {
        if (category.name === "") {
            return category.children.map(c => this.searchDatabaseInternally(c)).reduce((l, r) => l.concat(r), []);
        }

        let jsx = null;
        if (category.name.toLowerCase().includes(searchInput)) {
            let suffix = QuestionTreeCategory.getCategorySuffix(category);
            jsx = <li key={"flat_" + category.uuid}>
                <p className="linkButton"
                   onClick={() => this.props.goToSettings(category.uuid, false)}>{category.name}</p>
                {suffix}</li>;
        }
        let next = category.children.map(c => this.searchDatabaseInternally(c, searchInput)).reduce((l, r) => l.concat(r), []);
        if (jsx) {
            next = [jsx].concat(next);
        }
        return next;
    }

    searchDatabase(category, searchInput) {
        const databaseResults = this.searchDatabaseInternally(category, searchInput);
        if (databaseResults.length === 0) {
            return null;
        } else {
            return <ul key="searchDB">{databaseResults}</ul>;
        }
    }

    searchQuestionsInternally(category, searchInput) {
        const matchingQuestions = category.questions.filter(q => {
            return q.question.toLowerCase().includes(searchInput)
                || q.id.toLowerCase().includes(searchInput)
                || q.answers.filter(a => a.toLowerCase().includes(searchInput)).length > 0;
        }).map(q => {
            return <li key={"question_" + q.uuid}>
                <p className="linkButton"
                   onClick={() => {
                       this.props.quickStartQuestions(q.uuid);
                   }}>{q.id}: {q.question}</p>
            </li>;
        });

        return matchingQuestions.concat(category.children.map(c => this.searchQuestionsInternally(c, searchInput))
            .reduce((l, r) => l.concat(r), []));
    }

    searchQuestions(category, searchInput) {
        const databaseResults = this.searchQuestionsInternally(category, searchInput);
        if (databaseResults.length === 0) {
            return null;
        } else {
            return <ul key="searchQ">{databaseResults}</ul>;
        }
    }

    searchDatabaseTree(category, searchInput) {
        const category_results = this.searchDatabase(category, searchInput);
        const question_results = this.searchQuestions(category, searchInput);

        const rendered_categories = category_results ? <React.Fragment>
            <Header as="h2" key="header_cat">Kategorien</Header>
            {category_results}
        </React.Fragment> : null;

        const rendered_questions = question_results ? <React.Fragment>
            <Header as="h2" key="header_cat">Fragen</Header>
            {question_results}
        </React.Fragment> : null;

        if (!rendered_categories && !rendered_questions) {
            return <p>Keine Suchergebnisse.</p>;
        } else {
            return <React.Fragment>
                {rendered_categories}
                {rendered_questions}
            </React.Fragment>;
        }
    }

    render() {
        const {searchInput} = this.state;
        const databaseRendered = searchInput.length < 2 ?
            <ul key="rootNode" className="questionTree">
                {this.renderDatabaseTree(this.props.category)}
            </ul> :
            this.searchDatabaseTree(this.props.category, searchInput);

        return <React.Fragment>
            <Input fluid placeholder="Frage oder Kategorie" icon="search"
                   onChange={this.setSearchInput} value={searchInput}
                   style={{marginTop: "0.4em"}}/>

            {databaseRendered}
        </React.Fragment>;
    }
}

QuestionTreeCategory.propTypes = {
    category: PropTypes.object.isRequired,
    quickStartQuestions: PropTypes.func.isRequired,
    goToSettings: PropTypes.func.isRequired,
    color: PropTypes.string.isRequired,
};

export default QuestionTreeCategory;
