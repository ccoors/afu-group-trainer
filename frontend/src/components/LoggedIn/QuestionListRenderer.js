import React from 'react';
import PropTypes from 'prop-types';
import {Button, Confirm, Form, Icon, Loader, Modal, Table} from "semantic-ui-react";
import QuestionRORenderer from "../QuestionRORenderer";
import {createQuestionList, deleteQuestionList} from "../../util/actions";

function QuestionListEntry(props) {
    let public_status = null;
    if (!props.publicLists) {
        if (props.list.is_public) {
            public_status = <Table.Cell collapsing positive textAlign='center'><Icon name='checkmark'/></Table.Cell>;
        } else {
            public_status = <Table.Cell collapsing negative textAlign='center'><Icon name='x'/></Table.Cell>;
        }
    }

    return <Table.Row>
        <Table.Cell>{props.list.name}</Table.Cell>
        {public_status}
        <Table.Cell collapsing textAlign='center'>{props.list.questions.length}</Table.Cell>
        <Table.Cell collapsing textAlign='center'>
            <Button.Group size='tiny'>
                <Button icon="eye" color="green" title="Liste anzeigen" onClick={props.onShow}/>
                {props.allowEdit &&
                <Button icon="edit" color="yellow" title="Liste bearbeiten" onClick={props.onEdit}/>}
                {props.allowEdit &&
                <Button icon="delete" color="red" title="Liste löschen" onClick={props.onDelete}/>}
            </Button.Group>
        </Table.Cell>
    </Table.Row>;
}

function findQuestion(root, question) {
    const ret = root.questions.find(q => q.uuid === question);
    if (ret) {
        return ret;
    }

    const findings = root.children.map(c => findQuestion(c, question));
    const child = findings.find(c => c !== null);

    if (child) {
        return child;
    } else {
        return null;
    }
}

class ListNameInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            input: "",
        }
    }

    handleChange(e) {
        this.setState({
            input: e.target.value
        });
    }

    render() {
        return <Modal
            open={true}
            onClose={this.props.onClose}
            size='small'
            closeIcon>
            <Modal.Header>Neue Liste erstellen</Modal.Header>
            <Modal.Content scrolling>
                <Form>
                    <Form.Input
                        id='form-create-name'
                        value={this.state.input}
                        onChange={this.handleChange.bind(this)}
                        label='Listenname'
                        placeholder='Neue Liste'
                    />
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={this.props.onClose} negative>
                    Schließen
                </Button>
                <Button onClick={() => {
                    this.props.onCreate(this.state.input);
                }} disabled={this.state.input.trim() === ""} positive>
                    Erstellen
                </Button>
            </Modal.Actions>
        </Modal>;
    }
}

ListNameInput.propTypes = {
    onCreate: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

function DeleteQuestionListConfirmation(props) {
    return <Confirm
        open={props.open}
        header='Fragenliste bearbeiten'
        content='Möchten Sie die Fragenliste wirklich löschen?'
        cancelButton='Nein'
        confirmButton='Ja'
        onCancel={props.onCancel}
        onConfirm={props.onConfirm}
    />;
}

const ListRendererStates = Object.freeze({
    IDLE: 1,
    SHOWING: 2,
    EDITING: 3,
    NAMING: 4,
    CONFIRMING_DELETE: 5,
});

class QuestionListRenderer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            show: null,
            mode: ListRendererStates.IDLE,
        };
    }

    questionListTable() {
        const table = this;
        const rows = this.props.questionList.map(l => {
            return <QuestionListEntry {...table.props} key={l.uuid} list={l} onShow={() => {
                table.setState({
                    show: l,
                    mode: ListRendererStates.SHOWING,
                });
            }} onEdit={() => {
                table.setState({
                    show: l,
                    mode: ListRendererStates.EDITING,
                });
            }} onDelete={() => {
                table.setState({
                    show: l,
                    mode: ListRendererStates.CONFIRMING_DELETE,
                });
            }}/>;
        });

        return <Table celled striped>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    {!this.props.publicLists && <Table.HeaderCell collapsing>Öffentlich</Table.HeaderCell>}
                    <Table.HeaderCell collapsing>#Fragen</Table.HeaderCell>
                    <Table.HeaderCell collapsing>Aktionen</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {rows}
            </Table.Body>
        </Table>;
    }

    render() {
        if (this.props.questionList) {
            let onClose = () => {
                this.setState({
                    show: null,
                    mode: ListRendererStates.IDLE,
                });
            };

            switch (this.state.mode) {
                case ListRendererStates.IDLE:
                    return <div>
                        {this.props.questionList.length === 0 ?
                            <p>Keine Fragenlisten vorhanden</p> : this.questionListTable()}

                        {this.props.allowEdit && <Button icon labelPosition='left' color='green' onClick={() => {
                            this.setState({
                                mode: ListRendererStates.NAMING,
                            });
                        }}>
                            <Icon name='add'/>
                            Neue Fragenliste erstellen
                        </Button>}
                    </div>;
                case ListRendererStates.SHOWING:
                    const questions = this.state.show.questions.map(q => {
                        let question = findQuestion(this.props.questionDatabase, q);
                        if (question) {
                            return <QuestionRORenderer question={question} correctAnswer={-1} key={q} compact={true}/>;
                        } else {
                            return <p key={q}>
                                <strong>
                                    Die Frage <code>{q}</code> konnte in der Datenbank nicht gefunden werden!
                                </strong>
                            </p>;
                        }
                    });
                    return <Modal
                        open={true}
                        onClose={onClose}
                        size='large'
                        closeIcon>
                        <Modal.Header>Liste anzeigen: {this.state.show.name}</Modal.Header>
                        <Modal.Content scrolling>
                            <p>Die Liste is {!this.state.show.is_public && <span>nicht</span>} öffentlich.</p>
                            {questions}
                        </Modal.Content>
                        <Modal.Actions>
                            <Button onClick={onClose} negative>
                                Schließen
                            </Button>
                        </Modal.Actions>
                    </Modal>;
                case ListRendererStates.EDITING:
                    return null; // TODO
                case ListRendererStates.NAMING:
                    let onCreate = (name) => {
                        this.props.actionHandler(createQuestionList(name));
                        this.setState({
                            mode: ListRendererStates.IDLE
                        });
                    };
                    return <ListNameInput onClose={onClose.bind(this)} onCreate={onCreate.bind(this)}/>;
                case ListRendererStates.CONFIRMING_DELETE:
                    return <DeleteQuestionListConfirmation open={true}
                                                           onCancel={() => {
                                                               this.setState({
                                                                   mode: ListRendererStates.IDLE,
                                                               });
                                                           }} onConfirm={() => {
                        this.props.actionHandler(deleteQuestionList(this.state.show.uuid));
                        this.setState({
                            mode: ListRendererStates.IDLE,
                        });
                    }}/>;
                default:
                    return <p><strong>Fatal:</strong> Unknown mode {this.state.mode}</p>;
            }
        } else {
            return <Loader active={true} inline="centered" content="Warte auf Fragenliste..."/>;
        }
    }
}

QuestionListRenderer.propTypes = {
    questionDatabase: PropTypes.object.isRequired,
    actionHandler: PropTypes.func,
    questionList: PropTypes.array,
    allowEdit: PropTypes.bool,
    publicLists: PropTypes.bool,
};

QuestionListRenderer.defaultProps = {
    allowEdit: false,
    publicLists: true,
};

export default QuestionListRenderer;
