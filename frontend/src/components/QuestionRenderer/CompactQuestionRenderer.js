import React from 'react';
import PropTypes from 'prop-types';
import {Button, Segment} from "semantic-ui-react";
import {questionTitle, stringToJSX} from "../../util/util";
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
        const {question} = this.props;

        return <Segment>
            {question.outdated &&
            <OutdatedQuestionLabel/>}
            {this.props.onDelete &&
            <Button circular icon='close' color="red" floated="right"
                    onClick={() => this.props.onDelete(this.props.question.uuid)}/>}
            <strong>{questionTitle(question)}:</strong> {stringToJSX(question.question)}
            {this.renderSegment("A", question.answers[0])}
            {this.renderSegment("B", question.answers[1])}
            {this.renderSegment("C", question.answers[2])}
            {this.renderSegment("D", question.answers[3])}
        </Segment>;
    }
}

CompactQuestionRenderer.propTypes = {
    question: PropTypes.object.isRequired,
    onDelete: PropTypes.func,
};

export default CompactQuestionRenderer;