import React from "react";

import {
    Container,
    Header,
    Segment,
    Icon,
    Step,
    Button,
    Form,
    Checkbox,
    Input,
} from "semantic-ui-react";

import {generateEmptyQuestion} from "../util";
import QuestionRORenderer from "./question_renderer_ro"
import Results from "./results";
import QuestionProgress from "./question_progress";
import {RoomMasterModes} from "./App";

class RoomMaster extends React.Component {
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

    renderDatabaseTree(category) {
        if (category.name === "") {
            return category.children.map(c => this.renderDatabaseTree(c));
        }
        let childrenTree = category.children.map(c => this.renderDatabaseTree(c));

        let suffix = RoomMaster.getCategorySuffix(category);

        return <li key={"deep_" + category.uuid}>
            <p className="linkButton"
               onClick={() => this.props.roomMaster.setStartUUID(category.uuid, false)}>{category.name}</p>
            {suffix}
            {childrenTree.length > 0 && <ul>{childrenTree}</ul>}
        </li>;
    }

    renderDatabaseNormal() {
        return <ul key="rootNode">
            {this.props.questionDatabase.children.map(c => this.renderDatabaseTree(c))}
        </ul>;
    }

    searchDatabaseInternally(category) {
        if (category.name === "") {
            return category.children.map(c => this.searchDatabaseInternally(c)).reduce((l, r) => l.concat(r), []);
        }

        let jsx = null;
        if (category.name.toLowerCase().includes(this.props.roomMaster.searchInput)) {
            let suffix = RoomMaster.getCategorySuffix(category);
            jsx = <li key={"flat_" + category.uuid}>
                <p className="linkButton"
                   onClick={() => this.props.roomMaster.setStartUUID(category.uuid, false)}>{category.name}</p>
                {suffix}</li>;
        }
        let next = category.children.map(c => this.searchDatabaseInternally(c)).reduce((l, r) => l.concat(r), []);
        if (jsx) {
            next = [jsx].concat(next);
        }
        return next;
    }

    searchDatabase() {
        let databaseResults = this.searchDatabaseInternally(this.props.questionDatabase);
        console.log(databaseResults);
        if (databaseResults.length === 0) {
            return null;
        } else {
            return <ul key="searchDB">{databaseResults}</ul>;
        }
    }

    searchQuestionsInternally(category) {
        let matchingQuestions = category.questions.filter(q => {
            return q.question.toLowerCase().includes(this.props.roomMaster.searchInput)
                || q.id.toLowerCase().includes(this.props.roomMaster.searchInput)
                || q.answers.filter(a => a.toLowerCase().includes(this.props.roomMaster.searchInput)).length > 0;
        }).map(q => {
            return <li key={"question_" + q.uuid}>
                <p className="linkButton"
                   onClick={() => {
                       this.props.roomMaster.setStartUUID(q.uuid, true, () => this.props.roomMaster.startQuestions());
                   }}>{q.id}: {q.question}</p>
            </li>;
        });

        return matchingQuestions.concat(category.children.map(c => this.searchQuestionsInternally(c)).reduce((l, r) => l.concat(r), []));
    }

    searchQuestions() {
        let databaseResults = this.searchQuestionsInternally(this.props.questionDatabase);
        if (databaseResults.length === 0) {
            return null;
        } else {
            return <ul key="searchQ">{databaseResults}</ul>;
        }
    }

    startABCDQuestions() {
        this.props.roomMaster.setStartUUID("", true, () => this.props.roomMaster.startQuestions());
    }

    render() {
        console.log(this.props.roomMaster);

        let content = null;

        let replacedQuestion = false;
        let question = generateEmptyQuestion();
        if (this.props.roomQuestion && this.props.roomQuestion.hasOwnProperty("uuid")) {
            question = this.props.roomQuestion;
            replacedQuestion = true;
        }

        if (this.props.roomMaster.mode === RoomMasterModes.IDLE) {
            let databaseRendered = this.props.roomMaster.searchInput.length < 2 ?
                this.renderDatabaseNormal() :
                [<Header as="h2">Kategorien</Header>, this.searchDatabase(),
                    <Header as="h2">Fragen</Header>, this.searchQuestions()];

            content = <div>
                <Input fluid placeholder="Frage oder Kategorie" icon="search"
                       onChange={this.props.roomMaster.setSearchInput} value={this.props.roomMaster.searchInput}
                       style={{marginTop: "0.4em"}}/>
                {databaseRendered}
            </div>;
        } else if (this.props.roomMaster.mode === RoomMasterModes.SETTINGS) {
            content = <Segment>
                <Header as="h1">Einstellungen</Header>
                <Form>
                    <Form.Field>
                        <Checkbox label={{children: "Fragen mischen"}} checked={this.props.roomMaster.shuffleQuestions}
                                  onChange={this.props.roomMaster.toggleShuffle}/><br/>
                        <Checkbox label={{children: "Nicht mehr relevante Fragen stellen"}}
                                  checked={this.props.roomMaster.showObsoleteQuestions}
                                  onChange={this.props.roomMaster.toggleOutdated}/>
                    </Form.Field>

                    <Button.Group>
                        <Button color="red" icon labelPosition="left"
                                onClick={this.props.roomMaster.backToIdle}>
                            <Button.Content visible>Zurück</Button.Content>
                            <Icon name="chevron left"/>
                        </Button>
                        <Button color="green" icon labelPosition="right"
                                onClick={this.props.roomMaster.startQuestions}>
                            <Button.Content visible>Starten</Button.Content>
                            <Icon name="play"/>
                        </Button>
                    </Button.Group>
                </Form>
            </Segment>;
        } else if (this.props.roomMaster.mode === RoomMasterModes.RUNNING) {
            content = <div>
                <p>Bisher wurde die Frage von {this.props.questionUserState.selected} beantwortet.</p>
                <QuestionRORenderer
                    question={question}
                    correctAnswer={-1}/>

                <Button.Group fluid>
                    <Button color="red" size="small" icon labelPosition="left"
                            onClick={this.props.roomMaster.endQuestions}>
                        <Button.Content visible>Fragen beenden</Button.Content>
                        <Icon name="close"/>
                    </Button>
                    {replacedQuestion &&
                    <Button color="yellow" size="small" icon labelPosition="right"
                            onClick={this.props.roomMaster.nextQuestion}>
                        <Button.Content visible>Frage überspringen</Button.Content>
                        <Icon name="fast forward"/>
                    </Button>}
                    <Button color="green" size="small" icon labelPosition="right"
                            onClick={this.props.roomMaster.showResults}>
                        <Button.Content visible>Frage auswerten</Button.Content>
                        <Icon name="chart bar"/>
                    </Button>
                </Button.Group>
            </div>;
        } else if (this.props.roomMaster.mode === RoomMasterModes.RESULTS) {
            content = <div>
                <Results roomResults={this.props.roomResults} selectedAnswer={-1} roomQuestion={question}/><br/>

                <Button.Group fluid>
                    <Button color="red" size="small" icon labelPosition="left"
                            onClick={this.props.roomMaster.endQuestions}>
                        <Button.Content visible>Fragen beenden</Button.Content>
                        <Icon name="close"/>
                    </Button>
                    <Button color="green" size="small" icon labelPosition="right"
                            onClick={this.props.roomMaster.nextQuestion}>
                        <Button.Content visible>Nächste Frage</Button.Content>
                        <Icon name="right arrow"/>
                    </Button>
                </Button.Group>
            </div>;
        }
        let title = "Raum " + this.props.roomName + " - Referentensicht";
        if (this.props.questionUserState.total) {
            title += " (" + this.props.questionUserState.total + " online)";
        }

        let topContent = this.props.roomMaster.mode < RoomMasterModes.RUNNING ?
            <div>{this.props.roomMaster.mode === RoomMasterModes.IDLE &&
            <Button color={this.props.color} size="small" onClick={this.startABCDQuestions.bind(this)}>
                <Button.Content visible>Leere ABCD-Fragen stellen</Button.Content>
            </Button>}

                <Step.Group size="mini" widths={2}>
                    <Step active={this.props.roomMaster.mode === RoomMasterModes.IDLE}
                          completed={this.props.roomMaster.mode > RoomMasterModes.IDLE}>
                        <Icon name="question"/>
                        <Step.Content>
                            <Step.Title>Fragen auswählen</Step.Title>
                        </Step.Content>
                    </Step>

                    <Step active={this.props.roomMaster.mode === RoomMasterModes.SETTINGS}
                          completed={this.props.roomMaster.mode > RoomMasterModes.SETTINGS}>
                        <Icon name="settings"/>
                        <Step.Content>
                            <Step.Title>Einstellungen</Step.Title>
                        </Step.Content>
                    </Step>
                </Step.Group></div> : null;


        return (
            <Container text>
                <QuestionProgress questionProgress={this.props.questionProgress} color={this.props.color}/>
                <Segment>
                    <Header as="h1" content={title}/>
                    {topContent}

                    {content}
                </Segment>

                {this.props.roomMaster.mode === RoomMasterModes.IDLE &&
                <Button negative icon labelPosition="left" onClick={this.props.leaveRoom}>
                    <Button.Content visible>Raum verlassen</Button.Content>
                    <Icon name="close"/>
                </Button>}
            </Container>
        );
    }
}

export default RoomMaster;
