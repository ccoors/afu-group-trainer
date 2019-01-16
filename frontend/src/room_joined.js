import React from "react";

import {
    Container,
    Header,
    Placeholder,
    Segment,
    Button,
} from "semantic-ui-react";

import QuestionRenderer from "./question_renderer";
import Results from "./results";
import {generateEmptyQuestion} from "./util";
import QuestionProgress from "./question_progress";

class RoomStateRenderer extends React.Component {
    selectAnswer(value) {
        this.props.selectAnswer(value);
    }

    render() {
        switch (this.props.roomState) {
            case 0: // Waiting for questions
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
            case 1: // Question
                let question = this.props.roomQuestion ? this.props.roomQuestion : generateEmptyQuestion();

                return <QuestionRenderer question={question} selectAnswer={this.selectAnswer.bind(this)}
                                         selectedAnswer={this.props.selectedAnswer}/>;
            case 2: // Results
                return <Results roomResults={this.props.roomResults} selectedAnswer={this.props.selectedAnswer}
                                roomQuestion={this.props.roomQuestion}/>;
            default:
                return <div>Unknown state</div>;
        }
    }
}

class RoomJoined extends React.Component {
    render() {
        return (
            <Container text>
                <QuestionProgress questionProgress={this.props.questionProgress} color={this.props.color}/>

                <Segment stacked raised>
                    <RoomStateRenderer roomState={this.props.roomState} roomQuestion={this.props.roomQuestion}
                                       roomResults={this.props.roomResults} selectAnswer={this.props.selectAnswer}
                                       selectedAnswer={this.props.selectedAnswer}/>

                </Segment>

                <Button negative onClick={this.props.leaveRoom}>Raum verlassen</Button>
            </Container>
        );
    }
}

export default RoomJoined;
