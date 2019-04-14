import React from 'react';
import PropTypes from 'prop-types';
import {Header} from "semantic-ui-react";
import QuestionListRenderer from "./QuestionListRenderer";

class ManageQuestionLists extends React.Component {
    render() {
        return <div>
            <Header as="h1" content="Fragenlisten verwalten"/>
            <Header as="h2" content="Meine Fragenlisten"/>
            <QuestionListRenderer questionList={this.props.appState.myQuestionLists}
                                  questionDatabase={this.props.appState.questionDatabase}
                                  publicLists={false} allowEdit={true}/>

            <Header as="h2" content="Öffentliche Fragelisten"/>
            <QuestionListRenderer questionList={this.props.appState.publicQuestionLists}
                                  questionDatabase={this.props.appState.questionDatabase}/>
        </div>;
    }
}

ManageQuestionLists.propTypes = {
    appState: PropTypes.object.isRequired,
};

export default ManageQuestionLists;
