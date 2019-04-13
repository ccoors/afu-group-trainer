import React from 'react';
import PropTypes from 'prop-types';

import {Progress} from "semantic-ui-react";

class QuestionProgress extends React.Component {
    render() {
        if (!this.props.appState.roomState) {
            return null;
        }

        if (this.props.appState.roomState.initialQuestionLength > 1) {
            let total = this.props.appState.roomState.initialQuestionLength;
            let value = total - this.props.appState.roomState.remainingQuestions;
            return <Progress size="small" color="black" value={value} total={total} progress="ratio"/>;
        }

        return null;
    }
}

QuestionProgress.propTypes = {
    appState: PropTypes.object.isRequired
};

export default QuestionProgress;
