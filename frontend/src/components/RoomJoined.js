import React from "react";

import {Button, Container, Header, Placeholder, Segment,} from "semantic-ui-react";

import QuestionRenderer from "./QuestionRenderer";
import Results from "./Results";
import {generateEmptyQuestion} from "../util/util";
import QuestionProgress from "./QuestionProgress";
import {selectAnswer} from "../util/actions";
import {RoomModes} from "./Controller";

class RoomStateRenderer extends React.Component {
    selectAnswer(value) {
        this.props.appState.actionHandler(selectAnswer(value))
    }

    render() {
        if (!this.props.appState.roomState) {
            return null;
        }
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
                let question = this.props.appState.roomState.question ?
                    this.props.appState.roomState.question : generateEmptyQuestion();

                return <QuestionRenderer question={question} selectAnswer={this.selectAnswer.bind(this)}
                                         selectedAnswer={this.props.appState.selectedAnswer}/>;
            case RoomModes.RESULTS:
                return <Results roomResults={this.props.roomResults} selectedAnswer={this.props.selectedAnswer}
                                roomQuestion={this.props.roomQuestion}/>;
            default:
                return <div>Unknown state: {this.props.appState.roomState.state}</div>;
        }
    }
}

class RoomJoined extends React.Component {
    render() {
        return (
            <Container text>
                <QuestionProgress appState={this.props.appState} color={this.props.color}/>

                <Segment stacked raised>
                    <RoomStateRenderer {...this.props}/>
                </Segment>

                <Button negative onClick={this.props.leaveRoom}>Raum verlassen</Button>
            </Container>
        );
    }
}

export default RoomJoined;
