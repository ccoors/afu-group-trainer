import PropTypes from 'prop-types';
import React from 'react';
import { Button, Segment } from 'semantic-ui-react';
import { questionTitle, stringToJSX } from '../../util/util';
import OutdatedQuestionLabel from './OutdatedQuestionLabel';

class CompactQuestionRenderer extends React.Component {
  renderSegment(nr, answer, correct) {
    let colon = answer.trim() !== '' ? ':' : '';
    return <div>
      <strong>{nr}{colon}</strong>&nbsp;
      {stringToJSX(answer)}
      {correct && <span>&nbsp;&#x2713;</span>}
    </div>;
  }

  render() {
    const { question } = this.props;
    let correctAnswer = -1;
    if (question.hasOwnProperty('correctAnswer')) {
      correctAnswer = question.correctAnswer;
    }

    return <Segment>
      {question.outdated &&
      <OutdatedQuestionLabel />}
      {this.props.onDelete &&
      <Button circular icon='close' color="red" floated="right"
              onClick={() => this.props.onDelete(this.props.question.uuid)} />}
      <strong>{questionTitle(question)}:</strong> {stringToJSX(question.question)}
      {this.renderSegment('A', question.answers[0], correctAnswer === 0)}
      {this.renderSegment('B', question.answers[1], correctAnswer === 1)}
      {this.renderSegment('C', question.answers[2], correctAnswer === 2)}
      {this.renderSegment('D', question.answers[3], correctAnswer === 3)}
    </Segment>;
  }
}

CompactQuestionRenderer.propTypes = {
  question: PropTypes.object.isRequired,
  onDelete: PropTypes.func,
};

export default CompactQuestionRenderer;
