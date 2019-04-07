import React from "react";

import {Progress} from "semantic-ui-react";

class QuestionProgress extends React.Component {
    render() {
        if (this.props.questionProgress.initialQuestionLength && this.props.questionProgress.initialQuestionLength > 1) {
            let total = this.props.questionProgress.initialQuestionLength;
            let value = total - this.props.questionProgress.remainingQuestions;
            return <Progress size="small" color="black" value={value} total={total} progress="ratio"/>;
        }
        return null;
    }
}

export default QuestionProgress;
