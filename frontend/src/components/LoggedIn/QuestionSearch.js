import React from 'react';
import PropTypes from 'prop-types';
import {Search} from "semantic-ui-react";
import {findQuestions} from "../../util/util";

const resultRenderer = (e) => {
    return <p>
        <strong>{e.title}</strong>
        <br/>
        {e.question.question}
        <br/>
        A: {e.question.answers[0]}
        <br/>
        B: {e.question.answers[1]}
        <br/>
        C: {e.question.answers[2]}
        <br/>
        D: {e.question.answers[3]}
    </p>;
};

class QuestionSearch extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            results: [],
            value: ''
        }
    }

    handleSearchChange(e, data) {
        const searchTerm = data.value.toLowerCase();
        let matches = [];

        if (searchTerm.length > 1) {
            matches = findQuestions(this.props.questionDatabase, searchTerm);
            matches = matches.map(m => {
                return {
                    title: m.id,
                    uuid: m.uuid,
                    question: m
                }
            })
        }

        this.setState({
            value: searchTerm,
            results: matches
        });
    }

    render() {
        return (
            <Search
                fluid
                loading={false}
                onResultSelect={(e, {result}) => {
                    this.setState({
                        results: [],
                        value: ''
                    });
                    this.props.onSelect(result.uuid)
                }}
                onSearchChange={this.handleSearchChange.bind(this)}
                results={this.state.results}
                value={this.state.value}
                resultRenderer={resultRenderer}
            />
        );
    }
}

QuestionSearch.propTypes = {
    questionDatabase: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default QuestionSearch;