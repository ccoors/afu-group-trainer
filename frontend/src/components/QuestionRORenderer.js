import React from 'react';
import PropTypes from 'prop-types';

import {Label, Segment,} from "semantic-ui-react";

import {stringToJSX} from "../util/util";

class QuestionRORenderer extends React.Component {
    renderSegment(nr, answer, correct) {
        let colon = answer.trim() !== "" ? ":" : "";
        if (correct) {
            return <Segment color={"green"} inverted>
                <strong>{nr}{colon}</strong><br/>
                {stringToJSX(answer)}
            </Segment>;
        } else {
            return <Segment>
                <strong>{nr}{colon}</strong><br/>
                {stringToJSX(answer)}
            </Segment>;
        }
    }

    render() {
        return <Segment.Group>
            <Segment>
                {this.props.question.outdated &&
                <div><Label as="a" color="red" ribbon="right">
                    Nicht mehr relevante Frage
                </Label><br/></div>
                }
                <strong>{this.props.question.id}:</strong> {stringToJSX(this.props.question.question)}
            </Segment>
            {this.renderSegment("A", this.props.question.answers[0], this.props.correctAnswer === 0)}
            {this.renderSegment("B", this.props.question.answers[1], this.props.correctAnswer === 1)}
            {this.renderSegment("C", this.props.question.answers[2], this.props.correctAnswer === 2)}
            {this.renderSegment("D", this.props.question.answers[3], this.props.correctAnswer === 3)}
        </Segment.Group>;
    }
}

QuestionRORenderer.propTypes = {
    question: PropTypes.object.isRequired,
    correctAnswer: PropTypes.number.isRequired,
};

export default QuestionRORenderer;
