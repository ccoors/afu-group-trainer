import React from "react";

import {Progress} from "semantic-ui-react";

class QuestionProgress extends React.Component {
    render() {
        if (this.props.appState.initialQuestionLength && this.props.appState.initialQuestionLength > 1) {
            let total = this.props.appState.initialQuestionLength;
            let value = total - this.props.appState.remainingQuestions;
            return <Progress size="small" color="black" value={value} total={total} progress="ratio"/>;
        }
        return null;
    }
}

export default QuestionProgress;
