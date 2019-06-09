import PropTypes from 'prop-types';
import React from 'react';

import {Button, Container, Header, Icon, Segment} from 'semantic-ui-react';

import {endQuestions, leaveRoom, nextQuestion, questionSettings, showResults, startQuestions} from '../../util/actions';
import {generateEmptyQuestion, scrollToTop} from '../../util/util';
import {RoomMasterModes} from '../Controller';
import OnlineStatus from '../OnlineStatus';
import QuestionProgress from '../QuestionProgress';
import QuestionRORenderer from '../QuestionRenderer/QuestionRORenderer'
import Results from '../Results';
import QuestionSettings from './QuestionSettings';
import QuestionTree from './QuestionTree';

class RoomMaster extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            searchInput: '',

            uuid: '',
            single: false,

            selectedTab: 0,
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
        scrollToTop();
        this.props.appState.actionHandler(endQuestions());
    }

    nextQuestion() {
        scrollToTop();
        this.props.appState.actionHandler(nextQuestion());
    }

    showResults() {
        scrollToTop();
        this.props.appState.actionHandler(showResults());
    }

    startABCDQuestions() {
        this.quickStartQuestions('');
    }

    selectTab = (e, target) => this.setState({selectedTab: target.activeIndex});

    render() {
        let content = null;

        let hasNextQuestion = true;
        let emptyQuestion = true;
        let question = generateEmptyQuestion();
        if (this.props.appState.roomState) {
            if (this.props.appState.roomState.question &&
                this.props.appState.roomState.question.hasOwnProperty('uuid')) {
                question = this.props.appState.roomState.question;
                emptyQuestion = false;
                hasNextQuestion = this.props.appState.roomState.remainingQuestions > 0;
            }
        }

        if (this.props.appState.roomMasterMode === RoomMasterModes.IDLE) {
            content = <QuestionTree appState={this.props.appState} color={this.props.color}
                                    selectedTab={this.state.selectedTab} selectTab={this.selectTab}
                                    goToSettings={this.goToSettings.bind(this)}
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
                        <Icon name="left arrow"/>
                    </Button>
                    {hasNextQuestion && !emptyQuestion &&
                    <Button color="orange" size="small" icon labelPosition="right"
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
                {hasNextQuestion && <Button.Group fluid>
                    <Button color="red" size="small" icon labelPosition="left"
                            onClick={this.endQuestions.bind(this)}>
                        <Button.Content visible>Fragen beenden</Button.Content>
                        <Icon name="left arrow"/>
                    </Button>
                    <Button color="green" size="small" icon labelPosition="right"
                            onClick={this.nextQuestion.bind(this)}>
                        <Button.Content visible>Nächste Frage</Button.Content>
                        <Icon name="right arrow"/>
                    </Button>
                </Button.Group>}
                {!hasNextQuestion && <Button.Group fluid>
                    <Button color="orange" size="small" icon labelPosition="left"
                            onClick={this.endQuestions.bind(this)}>
                        <Button.Content visible>Zurück zur Fragenauswahl</Button.Content>
                        <Icon name="left arrow"/>
                    </Button>
                </Button.Group>}
            </div>;
        }

        return (
            <Container text>
                <QuestionProgress appState={this.props.appState}/>
                <Segment>
                    <OnlineStatus appState={this.props.appState}/>
                    <div>
                        <Header as="h1" content={'Referentensicht'}/>
                        {content}
                    </div>
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
