import React from 'react';
import PropTypes from 'prop-types';

import {Segment} from "semantic-ui-react";

import {stringToJSX} from "../../util/util";
import AnswerOption from "./AnswerOption";
import OutdatedQuestionLabel from "./OutdatedQuestionLabel";

class QuestionRORenderer extends React.Component {
    renderSegment(nr) {
        const letter = ["A", "B", "C", "D"][nr];
        const answer = this.props.question.answers[nr];
        const selected = nr === this.props.selectedAnswer;
        const correct = this.props.correctAnswer === nr;
        const wrong = selected && !(this.props.correctAnswer === -1) && !correct;

        let attributes = {};
        let letterStyle = {};

        const color = correct ? "green" : wrong ? "red" : "";
        if (color) {
            attributes.color = color;
            attributes.inverted = true;
            letterStyle.color = "white";
        }

        return <AnswerOption key={"answer" + nr} letter={letter} text={answer} attributes={attributes}
                             letterStyle={letterStyle}/>;
    }

    render() {
        const segments = [...Array(4).keys()].map(n => this.renderSegment(n));

        return <Segment.Group>
            <Segment>
                {this.props.question.outdated &&
                <OutdatedQuestionLabel/>}
                <strong>{this.props.question.id}:</strong>&nbsp;
                {stringToJSX(this.props.question.question)}
            </Segment>
            {segments}
        </Segment.Group>;
    }
}

QuestionRORenderer.propTypes = {
    question: PropTypes.object.isRequired,
    correctAnswer: PropTypes.number.isRequired,
    selectedAnswer: PropTypes.number,
    compact: PropTypes.bool,
};

QuestionRORenderer.defaultProps = {
    compact: false,
    selectedAnswer: -1,
};

export default QuestionRORenderer;
