import React from "react";

import {Button, Checkbox, Container, Form, Header, Icon, Input, Segment, Step,} from "semantic-ui-react";

import {generateEmptyQuestion, ltrim} from "../util/util";
import QuestionRORenderer from "./QuestionRORenderer"
import Results from "./Results";
import QuestionProgress from "./QuestionProgress";
import {RoomMasterModes} from "./Controller";
import {
    backToIdle,
    endQuestions,
    leaveRoom,
    nextQuestion,
    questionSettings,
    showResults,
    startQuestions
} from "../util/actions";

class RoomMaster extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            searchInput: "",
            shuffleQuestions: true,
            showOutdated: false,

            uuid: "",
            single: false,
        }
    }

    static getCategorySuffix(category) {
        if (category.prefix !== "" && category.questions.length !== 0) {
            return <p>Fragenprefix {category.prefix}, {category.questions.length} Fragen</p>;
        } else if (category.prefix !== "" && category.questions.length === 0) {
            return <p>Fragenprefix {category.prefix}</p>;
        } else if (category.questions.length !== 0) {
            return <p>{category.questions.length} Fragen</p>;
        } else {
            return "";
        }
    }

    toggleShuffle() {
        this.setState(state => {
            return {
                shuffleQuestions: !state.shuffleQuestions,
            }
        })
    }

    toggleOutdated() {
        this.setState(state => {
            return {
                showOutdated: !state.showOutdated,
            }
        })
    }

    setSearchInput(input) {
        this.setState({
            searchInput: ltrim(input.target.value.toLowerCase()),
        })
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
            showOutdated: true,
        }, () => {
            this.startQuestions();
        });
    }

    startQuestions() {
        this.props.appState.actionHandler(startQuestions(this.state.uuid,
            this.state.single,
            this.state.shuffleQuestions,
            this.state.showOutdated));
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

    renderDatabaseTree(category) {
        if (category.name === "") {
            return category.children.map(c => this.renderDatabaseTree(c));
        }
        let childrenTree = category.children.map(c => this.renderDatabaseTree(c));

        let suffix = RoomMaster.getCategorySuffix(category);

        return <li key={"deep_" + category.uuid}>
            <p className="linkButton"
               onClick={() => this.goToSettings(category.uuid, false)}>{category.name}</p>
            {suffix}
            {childrenTree.length > 0 && <ul>{childrenTree}</ul>}
        </li>;
    }

    renderDatabaseNormal() {
        return <ul key="rootNode">
            {this.props.appState.questionDatabase.children.map(c => this.renderDatabaseTree(c))}
        </ul>;
    }

    searchDatabaseInternally(category) {
        if (category.name === "") {
            return category.children.map(c => this.searchDatabaseInternally(c)).reduce((l, r) => l.concat(r), []);
        }

        let jsx = null;
        if (category.name.toLowerCase().includes(this.state.searchInput)) {
            let suffix = RoomMaster.getCategorySuffix(category);
            jsx = <li key={"flat_" + category.uuid}>
                <p className="linkButton"
                   onClick={() => this.goToSettings(category.uuid, false)}>{category.name}</p>
                {suffix}</li>;
        }
        let next = category.children.map(c => this.searchDatabaseInternally(c)).reduce((l, r) => l.concat(r), []);
        if (jsx) {
            next = [jsx].concat(next);
        }
        return next;
    }

    searchDatabase() {
        let databaseResults = this.searchDatabaseInternally(this.props.appState.questionDatabase);
        if (databaseResults.length === 0) {
            return null;
        } else {
            return <ul key="searchDB">{databaseResults}</ul>;
        }
    }

    searchQuestionsInternally(category) {
        let matchingQuestions = category.questions.filter(q => {
            return q.question.toLowerCase().includes(this.state.searchInput)
                || q.id.toLowerCase().includes(this.state.searchInput)
                || q.answers.filter(a => a.toLowerCase().includes(this.state.searchInput)).length > 0;
        }).map(q => {
            return <li key={"question_" + q.uuid}>
                <p className="linkButton"
                   onClick={() => {
                       this.quickStartQuestions(q.uuid);
                   }}>{q.id}: {q.question}</p>
            </li>;
        });

        return matchingQuestions.concat(category.children.map(c => this.searchQuestionsInternally(c)).reduce((l, r) => l.concat(r), []));
    }

    searchQuestions() {
        let databaseResults = this.searchQuestionsInternally(this.props.appState.questionDatabase);
        if (databaseResults.length === 0) {
            return null;
        } else {
            return <ul key="searchQ">{databaseResults}</ul>;
        }
    }

    startABCDQuestions() {
        this.quickStartQuestions("");
    }

    render() {
        let content = null;

        let replacedQuestion = false;
        let question = generateEmptyQuestion();
        if (this.props.appState.currentQuestion && this.props.appState.currentQuestion.hasOwnProperty("uuid")) {
            question = this.props.roomQuestion;
            replacedQuestion = true; // TODO: HasNextQuestion
        }

        if (this.props.appState.roomMasterMode === RoomMasterModes.IDLE) {
            let databaseRendered = this.state.searchInput.length < 2 ?
                this.renderDatabaseNormal() :
                [<Header as="h2" key="header_cat">Kategorien</Header>, this.searchDatabase(),
                    <Header as="h2" key="header_quest">Fragen</Header>, this.searchQuestions()];

            content = <div>
                <Input fluid placeholder="Frage oder Kategorie" icon="search"
                       onChange={this.setSearchInput.bind(this)} value={this.state.searchInput}
                       style={{marginTop: "0.4em"}}/>
                {databaseRendered}
            </div>;
        } else if (this.props.appState.roomMasterMode === RoomMasterModes.SETTINGS) {
            content = <Segment>
                <Header as="h1">Einstellungen</Header>
                <Form>
                    <Form.Field>
                        <Checkbox label={{children: "Fragen mischen"}} checked={this.state.shuffleQuestions}
                                  onChange={this.toggleShuffle.bind(this)}/><br/>
                        <Checkbox label={{children: "Nicht mehr relevante Fragen stellen"}}
                                  checked={this.state.showOutdated}
                                  onChange={this.toggleOutdated.bind(this)}/>
                    </Form.Field>

                    <Button.Group>
                        <Button color="red" icon labelPosition="left"
                                onClick={() => this.props.appState.actionHandler(backToIdle())}>
                            <Button.Content visible>Zurück</Button.Content>
                            <Icon name="chevron left"/>
                        </Button>
                        <Button color="green" icon labelPosition="right"
                                onClick={this.startQuestions.bind(this)}>
                            <Button.Content visible>Starten</Button.Content>
                            <Icon name="play"/>
                        </Button>
                    </Button.Group>
                </Form>
            </Segment>;
        } else if (this.props.appState.roomMasterMode === RoomMasterModes.RUNNING) {
            content = <div>
                <p>Bisher wurde die Frage von {this.props.appState.usersAnswered} beantwortet.</p>
                <QuestionRORenderer
                    question={question}
                    correctAnswer={-1}/>

                <Button.Group fluid>
                    <Button color="red" size="small" icon labelPosition="left"
                            onClick={this.endQuestions.bind(this)}>
                        <Button.Content visible>Fragen beenden</Button.Content>
                        <Icon name="close"/>
                    </Button>
                    {replacedQuestion &&
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
                <Results roomResults={this.props.roomResults} selectedAnswer={-1} roomQuestion={question}/><br/>

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
        let title = "Raum " + this.props.appState.roomName + " - Referentensicht";
        if (this.props.appState.usersOnline) {
            title += " (" + this.props.appState.usersOnline + " online)";
        }

        let topContent = this.props.appState.roomMasterMode < RoomMasterModes.RUNNING ?
            <div>{this.props.appState.roomMasterMode === RoomMasterModes.IDLE &&
            <Button color={this.props.color} size="small" onClick={this.startABCDQuestions.bind(this)}>
                <Button.Content visible>Leere ABCD-Fragen stellen</Button.Content>
            </Button>}

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
                </Step.Group></div> : null;


        return (
            <Container text>
                <QuestionProgress appState={this.props.appState} color={this.props.color}/>
                <Segment>
                    <Header as="h1" content={title}/>
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

export default RoomMaster;
