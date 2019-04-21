import React from 'react';
import PropTypes from 'prop-types';
import {Button, Checkbox, Form, Header, Message, Modal} from "semantic-ui-react";
import {updateQuestionList} from "../../util/actions";
import QuestionSearch from "./QuestionSearch";
import {findQuestion} from "../../util/util";
import SortContainer from "./SortContainer";
import CompactQuestionRenderer from "../QuestionRenderer/CompactQuestionRenderer";

class ListEditor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            newName: props.questionList.name,
            newPublic: props.questionList.is_public,
            newQuestions: props.questionList.questions,
        }
    }

    handleQuestionAppend(id) {
        this.setState(state => {
            if (state.newQuestions.some(q => q === id)) {
                return {};
            }
            return {
                newQuestions: state.newQuestions.concat([id])
            }
        }, this.updateQuestion)
    }

    handleQuestionResort(list) {
        this.setState({
            newQuestions: list
        }, this.updateQuestion);
    }

    handleQuestionRemove(id) {
        console.log("Remove id", id);
        this.setState(state => {
            const newQuestions = state.newQuestions.filter(q => q !== id);
            return {
                newQuestions: newQuestions
            }
        }, this.updateQuestion);
    }

    handleNameChange(e) {
        if (e.target.value.trim() === "") {
            return;
        }

        this.setState({
            newName: e.target.value,
        }, this.updateQuestion);
    }

    togglePublic() {
        this.setState(state => {
            return {
                newPublic: !state.newPublic
            }
        }, this.updateQuestion);
    }

    updateQuestion() {
        this.props.actionHandler(
            updateQuestionList(this.props.questionList.uuid,
                this.state.newName,
                this.state.newPublic,
                this.state.newQuestions));
    }

    render() {
        let questions = this.state.newQuestions.map(q => {
            let questionObject = findQuestion(this.props.questionDatabase, q);
            if (questionObject) {
                return <CompactQuestionRenderer key={q} question={questionObject}
                                                onDelete={this.handleQuestionRemove.bind(this)}/>;
            } else {
                return <p key={q}><strong>Fatal:</strong> Can not find question {q}!</p>;
            }
        });

        if (questions.length === 0) {
            questions = [<p key={"no-questions"}>Keine Fragen in der Liste.</p>];
        }

        return <Modal
            open={true}
            onClose={this.props.onClose}
            size='small'
            closeIcon
            closeOnEscape={false}
            closeOnDimmerClick={false}>
            <Modal.Header>Liste bearbeiten</Modal.Header>
            <Modal.Content scrolling>
                <strong>Die Änderungen an der Liste werden unmittelbar durchgeführt!</strong>
                <div style={{height: "2em"}}/>

                <Form>
                    <Form.Input
                        id='form-list-name'
                        value={this.state.newName}
                        onChange={this.handleNameChange.bind(this)}
                        label='Listenname'
                        placeholder='Neue Liste'
                    />
                </Form>
                <div style={{height: "1em"}}/>
                <Checkbox label='Liste anderen Ausbildern zur Verfügung stellen' checked={this.state.newPublic}
                          onChange={this.togglePublic.bind(this)}/>
                <Message color="blue">
                    <Message.Header>Informationen zur Veröffentlichung</Message.Header>
                    <p>Die Liste wird anderen Ausbildern nur lesbar zur Verwendung freigegeben.</p>
                </Message>

                <Header as="h2" content="Fragen"/>
                <Message>
                    <Message.Header>Fragen sortieren</Message.Header>
                    <p>Fragen können per Drag-and-Drop sortiert werden.</p>
                </Message>

                <SortContainer questions={questions} onResort={(list) => {
                    this.handleQuestionResort(list);
                }}/>

                <div style={{height: "1em"}}/>
                <p>Frage hinzufügen:</p>
                <QuestionSearch questionDatabase={this.props.questionDatabase} onSelect={(uuid) => {
                    this.handleQuestionAppend(uuid);
                }}/>
                <div style={{height: "10em"}}/>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={() => {
                    this.props.onClose();
                }} positive>
                    Bearbeitung beenden
                </Button>
            </Modal.Actions>
        </Modal>;
    }
}

ListEditor.propTypes = {
    questionDatabase: PropTypes.object.isRequired,
    actionHandler: PropTypes.func.isRequired,
    questionList: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ListEditor;
