import React from 'react';
import PropTypes from 'prop-types';
import {Label, Segment} from "semantic-ui-react";
import {stringToJSX} from "../../util/util";

class CompactQuestionRenderer extends React.Component {
    renderSegment(nr, answer) {
        let colon = answer.trim() !== "" ? ":" : "";
        return <div>
            <strong>{nr}{colon}</strong>&nbsp;
            {stringToJSX(answer)}
        </div>;
    }

    render() {
        return <Segment>
            {this.props.question.outdated &&
            <div><Label as="a" color="red" ribbon="right">
                Nicht mehr relevante Frage
            </Label><br/></div>}
            <strong>{this.props.question.id}:</strong> {stringToJSX(this.props.question.question)}
            {this.renderSegment("A", this.props.question.answers[0])}
            {this.renderSegment("B", this.props.question.answers[1])}
            {this.renderSegment("C", this.props.question.answers[2])}
            {this.renderSegment("D", this.props.question.answers[3])}
        </Segment>;
    }
}

CompactQuestionRenderer.propTypes = {
    question: PropTypes.object.isRequired,
};

export default CompactQuestionRenderer;