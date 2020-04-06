import PropTypes from 'prop-types';
import React from 'react';
import { Search } from 'semantic-ui-react';
import { findQuestions, questionTitle } from '../../util/util';

const resultRenderer = (e) => {
  const { question } = e;
  return <p>
    <strong>{questionTitle(question)}</strong>
    <br />
    {question.question}
    <br />
    A: {question.answers[0]}
    <br />
    B: {question.answers[1]}
    <br />
    C: {question.answers[2]}
    <br />
    D: {question.answers[3]}
  </p>;
};

class QuestionSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      results: [],
      value: ''
    };
  }

  handleSearchChange(e, data) {
    const searchTerm = data.value.toLowerCase();
    let matches = [];

    if (searchTerm.length > 1) {
      matches = findQuestions(this.props.questionDatabase, searchTerm);
      matches = matches.map(m => {
        return {
          title: m.uuid,
          uuid: m.uuid,
          question: m
        };
      });
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
        onResultSelect={(e, { result }) => {
          this.setState({
            results: [],
            value: ''
          });
          this.props.onSelect(result.uuid);
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
