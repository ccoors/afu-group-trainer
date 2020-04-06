import PropTypes from 'prop-types';
import React from 'react';

import { Button, Container, Dropdown, Header, Icon, Modal, Segment } from 'semantic-ui-react';

import {
  endQuestions,
  leaveRoom,
  nextQuestion,
  questionSettings,
  resetCountdown,
  showResults,
  startCountdown,
  startQuestions
} from '../../util/actions';
import { generateEmptyQuestion, scrollToTop } from '../../util/util';
import { RoomMasterModes } from '../Controller';
import { PreviousQuestionListRenderer } from '../LoggedIn/QuestionListRenderer';
import OnlineStatus from '../OnlineStatus';
import QuestionProgress from '../QuestionProgress';
import QuestionRORenderer from '../QuestionRenderer/QuestionRORenderer';
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
      previousQuestionsOpen: false,
    };

    this.endQuestions = this.endQuestions.bind(this);
    this.nextQuestion = this.nextQuestion.bind(this);
    this.showResults = this.showResults.bind(this);
    this.startABCDQuestions = this.startABCDQuestions.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);
    this.startCountdown = this.startCountdown.bind(this);
    this.resetCountdown = this.resetCountdown.bind(this);
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

  startCountdown(time) {
    this.props.appState.actionHandler(startCountdown(time));
  }

  resetCountdown() {
    this.props.appState.actionHandler(resetCountdown());
  }

  startABCDQuestions() {
    this.quickStartQuestions('');
  }

  closeModal() {
    this.setState({
      previousQuestionsOpen: false
    });
  }

  openModal() {
    this.setState({
      previousQuestionsOpen: true
    });
  }

  selectTab = (e, target) => this.setState({ selectedTab: target.activeIndex });

  render() {
    let content = null;

    let hasNextQuestion = true;
    let emptyQuestion = true;
    let question = generateEmptyQuestion();
    let textMode = true;
    let secondaryControlPanel = null;
    let countdown = null;
    let countdownPanel = null;

    if (this.props.appState.roomState) {
      if (this.props.appState.roomState.question &&
        this.props.appState.roomState.question.hasOwnProperty('uuid')) {
        question = this.props.appState.roomState.question;
        emptyQuestion = false;
        hasNextQuestion = this.props.appState.roomState.remainingQuestions > 0;
      }
      countdown = this.props.appState.roomState.countdown;
      const prevQuestions = this.props.appState.roomState.previousQuestions;

      if (this.props.appState.roomMasterMode === RoomMasterModes.RUNNING) {
        if (countdown) {
          countdownPanel = <React.Fragment>
            <Button color='red' onClick={this.resetCountdown}>
              Countdown stoppen ({countdown})
            </Button>
          </React.Fragment>;
        } else {
          countdownPanel = <Dropdown text='Countdown starten'>
            <Dropdown.Menu>
              <Dropdown.Item text='15 Sekunden' onClick={() => this.startCountdown(15)} />
              <Dropdown.Item text='30 Sekunden' onClick={() => this.startCountdown(30)} />
              <Dropdown.Item text='1 Minute' onClick={() => this.startCountdown(60)} />
              <Dropdown.Item text='2 Minuten' onClick={() => this.startCountdown(120)} />
              <Dropdown.Item text='5 Minuten' onClick={() => this.startCountdown(300)} />
            </Dropdown.Menu>
          </Dropdown>;
        }
      } else if (prevQuestions && prevQuestions.length > 0) {
        countdownPanel = <div style={{ marginBottom: '1em' }} />;
      }

      secondaryControlPanel = (
        <React.Fragment>
          {prevQuestions && prevQuestions.length > 0 ? <React.Fragment>
            <Modal open={this.state.previousQuestionsOpen}
                   onClose={this.closeModal}
                   size='small'
                   closeIcon
                   closeOnEscape={true}
                   closeOnDimmerClick={true}>
              <Modal.Header>Letzte Fragen</Modal.Header>
              <Modal.Content scrolling>
                <PreviousQuestionListRenderer list={prevQuestions} />
                <div style={{ height: '5em' }} />
              </Modal.Content>
              <Modal.Actions>
                <Button onClick={this.closeModal} positive>
                  Schließen
                </Button>
              </Modal.Actions>
            </Modal>
            <Button color="grey" icon labelPosition="left"
                    onClick={this.openModal}>
              <Button.Content visible>Letzte Fragen</Button.Content>
              <Icon name="history" />
            </Button>
          </React.Fragment> : null}

          {countdownPanel}
        </React.Fragment>
      );
    }

    if (this.props.appState.roomMasterMode === RoomMasterModes.IDLE) {
      textMode = false;
      content = <QuestionTree appState={this.props.appState} color={this.props.color}
                              selectedTab={this.state.selectedTab} selectTab={this.selectTab}
                              goToSettings={this.goToSettings.bind(this)}
                              quickStartQuestions={this.quickStartQuestions.bind(this)} />;
    } else if (this.props.appState.roomMasterMode === RoomMasterModes.SETTINGS) {
      content =
        <QuestionSettings appState={this.props.appState} onOk={this.startQuestions.bind(this)} />;
    } else if (this.props.appState.roomMasterMode === RoomMasterModes.RUNNING) {
      content = <div>
        <QuestionRORenderer
          question={question}
          correctAnswer={-1} />

        {secondaryControlPanel ? <React.Fragment>
          {secondaryControlPanel}
          <div style={{ height: '1em' }} />
        </React.Fragment> : null}

        <Button.Group fluid>
          <Button color="red" size="small" icon labelPosition="left"
                  onClick={this.endQuestions}>
            <Button.Content visible>Fragen beenden</Button.Content>
            <Icon name="left arrow" />
          </Button>
          {hasNextQuestion && !emptyQuestion &&
          <Button color="orange" size="small" icon labelPosition="right"
                  onClick={this.nextQuestion}>
            <Button.Content visible>Frage überspringen</Button.Content>
            <Icon name="fast forward" />
          </Button>}
          <Button color="green" size="small" icon labelPosition="right"
                  onClick={this.showResults}>
            <Button.Content visible>Frage auswerten</Button.Content>
            <Icon name="chart bar" />
          </Button>
        </Button.Group>
      </div>;
    } else if (this.props.appState.roomMasterMode === RoomMasterModes.RESULTS) {
      content = <div>
        <Results {...this.props} selectedAnswer={-1} question={question} /><br />
        {secondaryControlPanel}
        {hasNextQuestion && <Button.Group fluid>
          <Button color="red" size="small" icon labelPosition="left"
                  onClick={this.endQuestions}>
            <Button.Content visible>Fragen beenden</Button.Content>
            <Icon name="left arrow" />
          </Button>
          <Button color="green" size="small" icon labelPosition="right"
                  onClick={this.nextQuestion}>
            <Button.Content visible>Nächste Frage</Button.Content>
            <Icon name="right arrow" />
          </Button>
        </Button.Group>}
        {!hasNextQuestion && <Button.Group fluid>
          <Button color="orange" size="small" icon labelPosition="left"
                  onClick={this.endQuestions}>
            <Button.Content visible>Zurück zur Fragenauswahl</Button.Content>
            <Icon name="left arrow" />
          </Button>
        </Button.Group>}
      </div>;
    }

    return (
      <Container text={textMode}>
        <QuestionProgress appState={this.props.appState} />
        <Segment>
          <OnlineStatus appState={this.props.appState} />
          <div>
            <Header as="h1" content={'Referentensicht'} />
            {content}
          </div>
        </Segment>

        {this.props.appState.roomMasterMode === RoomMasterModes.IDLE &&
        <Button negative icon labelPosition="left"
                onClick={() => this.props.appState.actionHandler(leaveRoom())}>
          <Button.Content visible>Raum verlassen</Button.Content>
          <Icon name="close" />
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
