import React from 'react';
import PropTypes from 'prop-types';

import {Button, Container, Header, Placeholder, Segment,} from "semantic-ui-react";

import QuestionRenderer from "./QuestionRenderer/QuestionRenderer";
import Results from "./Results";
import {generateEmptyQuestion} from "../util/util";
import QuestionProgress from "./QuestionProgress";
import {leaveRoom, selectAnswer} from "../util/actions";
import {RoomModes} from "./Controller";
import OnlineStatus from "./OnlineStatus";

class RoomStateRenderer extends React.Component {
    selectAnswer(value) {
        this.props.appState.actionHandler(selectAnswer(value))
    }

    render() {
        if (!this.props.appState.roomState) {
            return null;
        }
        let question = this.props.appState.roomState.question ?
            this.props.appState.roomState.question : generateEmptyQuestion();

        switch (this.props.appState.roomState.state) {
            case RoomModes.IDLE:
                return <div><Header as="h1">Warte auf Fragen</Header>
                    <Placeholder fluid>
                        <Placeholder.Header image>
                            <Placeholder.Line/>
                            <Placeholder.Line/>
                        </Placeholder.Header>
                        <Placeholder.Paragraph>
                            <Placeholder.Line/>
                            <Placeholder.Line/>
                            <Placeholder.Line/>
                            <Placeholder.Line/>
                        </Placeholder.Paragraph>
                    </Placeholder></div>;
            case RoomModes.QUESTION:
                return <QuestionRenderer question={question} selectAnswer={this.selectAnswer.bind(this)}
                                         selectedAnswer={this.props.appState.selectedAnswer}/>;
            case RoomModes.RESULTS:
                return <Results appState={this.props.appState} selectedAnswer={this.props.appState.selectedAnswer}
                                question={question}/>;
            default:
                return <div>Unknown state: {this.props.appState.roomState.state}</div>;
        }
    }
}

RoomStateRenderer.propTypes = {
    appState: PropTypes.object.isRequired,
};

class RoomJoined extends React.Component {
    render() {
        return (
            <Container text>
                <QuestionProgress appState={this.props.appState}/>

                <Segment stacked raised>
                    <OnlineStatus appState={this.props.appState}/>
                    <RoomStateRenderer {...this.props}/>
                </Segment>

                <Button negative onClick={() => {
                    this.props.appState.actionHandler(leaveRoom());
                }}>Raum verlassen</Button>
            </Container>
        );
    }
}

RoomJoined.propTypes = {
    appState: PropTypes.object.isRequired,
};

export default RoomJoined;
