import React from 'react';
import PropTypes from 'prop-types';

import {Label, Segment,} from "semantic-ui-react";

import {stringToJSX} from "../util/util";

class QuestionRORenderer extends React.Component {
    renderSegment(nr) {
        const answer = this.props.question.answers[nr];
        const selected = nr === this.props.selectedAnswer;
        const correct = this.props.correctAnswer === nr;
        const wrong = selected && !(this.props.correctAnswer === - 1) && !correct;

        let attributes = {
            key: "answer" + nr,
        };

        const color = correct ? "green" : wrong ? "red" : "";
        if (color) {
            attributes.color = color;
            attributes.inverted = true
        }

        const colon = answer.trim() !== "" ? ":" : "";

        return <Segment {...attributes}>
            <strong>{nr}{colon}</strong>{!this.props.compact ? <br/> : <span>&nbsp;</span>}
            {stringToJSX(answer)}
        </Segment>;
    }

    render() {
        const segments = [...Array(4).keys()].map(n => this.renderSegment(n));

        return <Segment.Group>
            <Segment>
                {this.props.question.outdated &&
                <div><Label as="a" color="red" ribbon="right">
                    Nicht mehr relevante Frage
                </Label><br/></div>}
                <strong>{this.props.question.id}:</strong> {stringToJSX(this.props.question.question)}
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
};

export default QuestionRORenderer;
