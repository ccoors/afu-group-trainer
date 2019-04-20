import React from 'react';
import PropTypes from 'prop-types';
import {Button, Segment} from "semantic-ui-react";
import {stringToJSX} from "../../util/util";
import OutdatedQuestionLabel from "./OutdatedQuestionLabel";

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
            <OutdatedQuestionLabel/>}
            {this.props.onDelete &&
            <Button circular icon='close' color="red" floated="right"
                    onClick={() => this.props.onDelete(this.props.question.uuid)}/>}
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
    onDelete: PropTypes.func,
};

export default CompactQuestionRenderer;