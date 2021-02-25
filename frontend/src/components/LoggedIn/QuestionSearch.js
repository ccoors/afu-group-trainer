import PropTypes from 'prop-types';
import React from 'react';
import { Button, Search } from 'semantic-ui-react';
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
      value: '',
      selectedCatalog: null,
      selectedCatalogName: '',
    };

    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.triggerSearch = this.triggerSearch.bind(this);
  }

  handleSearchChange(e, data) {
    const searchTerm = data.value.toLowerCase();
    this.triggerSearch(searchTerm);
  }

  triggerSearch(searchTerm = null) {
    if (searchTerm === null) {
      searchTerm = this.state.value;
    }
    let matches = [];

    if (searchTerm.length > 1) {
      matches = findQuestions(this.state.selectedCatalog || this.props.questionDatabase, searchTerm);
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
      <React.Fragment>
        <p>Beschränken auf Katalog:</p>
        <Button.Group>
          <Button toggle active={this.state.selectedCatalog === null}
                  onClick={() => this.setState({
            selectedCatalog: null,
            selectedCatalogName: ''
          }, () => {
            this.triggerSearch();
          })}>Alle</Button>
          {this.props.questionDatabase.children.map(c => (
            <Button toggle active={this.state.selectedCatalogName === c.shortname}
                    onClick={() => {
              this.setState({
                selectedCatalog: c,
                selectedCatalogName: c.shortname
              }, () => {
                this.triggerSearch();
              });
            }}>{c.shortname}</Button>
          ))}
        </Button.Group>
        <div style={{ height: '5px' }} />
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
          onSearchChange={this.handleSearchChange}
          results={this.state.results}
          value={this.state.value}
          resultRenderer={resultRenderer}
        />
      </React.Fragment>
    );
  }
}

QuestionSearch.propTypes = {
  questionDatabase: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default QuestionSearch;
