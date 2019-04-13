import React from 'react';
import PropTypes from 'prop-types';

import {Button, Container, Header, Icon, Segment, Step,} from "semantic-ui-react";

import {generateEmptyQuestion} from "../../util/util";
import QuestionRORenderer from "../QuestionRORenderer"
import Results from "../Results";
import QuestionProgress from "../QuestionProgress";
import {RoomMasterModes} from "../Controller";
import {endQuestions, leaveRoom, nextQuestion, questionSettings, showResults, startQuestions} from "../../util/actions";
import QuestionSettings from "./QuestionSettings";
import QuestionTree from "./QuestionTree";
import OnlineStatus from "../OnlineStatus";

class RoomMaster extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            searchInput: "",

            uuid: "",
            single: false,
        }
    }

    goToSettings(uuid, single) {
        this.setState({
            uuid: uuid,
            single: single,
        });
        this.props.appState.actionHandler(questionSettings());
    }

    quickStartQuestions(uuid) {
        this.setState({
            uuid: uuid,
            single: true,
        }, () => {
            this.startQuestions(false, true);
        });
    }

    startQuestions(shuffleQuestions, showOutdated) {
        this.props.appState.actionHandler(startQuestions(this.state.uuid,
            this.state.single,
            shuffleQuestions,
            showOutdated));
    }

    endQuestions() {
        this.props.appState.actionHandler(endQuestions());
    }

    nextQuestion() {
        this.props.appState.actionHandler(nextQuestion());
    }

    showResults() {
        this.props.appState.actionHandler(showResults());
    }

    startABCDQuestions() {
        this.quickStartQuestions("");
    }

    render() {
        let content = null;

        let hasNextQuestion = false;
        let question = generateEmptyQuestion();
        if (this.props.appState.roomState) {
            if (this.props.appState.roomState.question &&
                this.props.appState.roomState.question.hasOwnProperty("uuid")) {
                question = this.props.appState.roomState.question;
                hasNextQuestion = this.props.appState.roomState.remainingQuestions > 0;
            }
        }

        if (this.props.appState.roomMasterMode === RoomMasterModes.IDLE) {
            content = <QuestionTree appState={this.props.appState} goToSettings={this.goToSettings.bind(this)}
                                    quickStartQuestions={this.quickStartQuestions.bind(this)}/>;
        } else if (this.props.appState.roomMasterMode === RoomMasterModes.SETTINGS) {
            content = <QuestionSettings appState={this.props.appState} onOk={this.startQuestions.bind(this)}/>;
        } else if (this.props.appState.roomMasterMode === RoomMasterModes.RUNNING) {
            content = <div>
                <QuestionRORenderer
                    question={question}
                    correctAnswer={-1}/>

                <Button.Group fluid>
                    <Button color="red" size="small" icon labelPosition="left"
                            onClick={this.endQuestions.bind(this)}>
                        <Button.Content visible>Fragen beenden</Button.Content>
                        <Icon name="close"/>
                    </Button>
                    {hasNextQuestion &&
                    <Button color="yellow" size="small" icon labelPosition="right"
                            onClick={this.nextQuestion.bind(this)}>
                        <Button.Content visible>Frage überspringen</Button.Content>
                        <Icon name="fast forward"/>
                    </Button>}
                    <Button color="green" size="small" icon labelPosition="right"
                            onClick={this.showResults.bind(this)}>
                        <Button.Content visible>Frage auswerten</Button.Content>
                        <Icon name="chart bar"/>
                    </Button>
                </Button.Group>
            </div>;
        } else if (this.props.appState.roomMasterMode === RoomMasterModes.RESULTS) {
            content = <div>
                <Results {...this.props} selectedAnswer={-1} question={question}/><br/>
                <Button.Group fluid>
                    <Button color="red" size="small" icon labelPosition="left"
                            onClick={this.endQuestions.bind(this)}>
                        <Button.Content visible>Fragen beenden</Button.Content>
                        <Icon name="close"/>
                    </Button>
                    <Button color="green" size="small" icon labelPosition="right"
                            onClick={this.nextQuestion.bind(this)}>
                        <Button.Content visible>Nächste Frage</Button.Content>
                        <Icon name="right arrow"/>
                    </Button>
                </Button.Group>
            </div>;
        }
        const title = "Raum " + this.props.appState.roomName + " - Referentensicht";

        const topContent = this.props.appState.roomMasterMode < RoomMasterModes.RUNNING ?
            <div>
                <Step.Group size="mini" widths={2}>
                    <Step active={this.props.appState.roomMasterMode === RoomMasterModes.IDLE}
                          completed={this.props.appState.roomMasterMode > RoomMasterModes.IDLE}>
                        <Icon name="question"/>
                        <Step.Content>
                            <Step.Title>Fragen auswählen</Step.Title>
                        </Step.Content>
                    </Step>

                    <Step active={this.props.appState.roomMasterMode === RoomMasterModes.SETTINGS}
                          completed={this.props.appState.roomMasterMode > RoomMasterModes.SETTINGS}>
                        <Icon name="settings"/>
                        <Step.Content>
                            <Step.Title>Einstellungen</Step.Title>
                        </Step.Content>
                    </Step>
                </Step.Group>

                {this.props.appState.roomMasterMode === RoomMasterModes.IDLE &&
                <Button color={this.props.color} size="small" onClick={this.startABCDQuestions.bind(this)}>
                    <Button.Content visible>Leere ABCD-Fragen stellen</Button.Content>
                </Button>}
            </div> : null;


        return (
            <Container text>
                <QuestionProgress appState={this.props.appState}/>
                <Segment>
                    <Header as="h1" content={title}/>
                    <OnlineStatus appState={this.props.appState}/>
                    {topContent}

                    {content}
                </Segment>

                {this.props.appState.roomMasterMode === RoomMasterModes.IDLE &&
                <Button negative icon labelPosition="left"
                        onClick={() => this.props.appState.actionHandler(leaveRoom())}>
                    <Button.Content visible>Raum verlassen</Button.Content>
                    <Icon name="close"/>
                </Button>}
            </Container>
        );
    }
}

RoomMaster.propTypes = {
    appState: PropTypes.object.isRequired,
    color: PropTypes.string.isRequired,
};


export default RoomMaster;
