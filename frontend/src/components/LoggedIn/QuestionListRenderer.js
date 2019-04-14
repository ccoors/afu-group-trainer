import React from 'react';
import PropTypes from 'prop-types';
import {Button, Icon, Loader, Modal, Table} from "semantic-ui-react";
import QuestionRORenderer from "../QuestionRORenderer";

function QuestionListEntry(props) {
    let public_status = null;
    if (!props.publicLists) {
        if (props.list.is_public) {
            public_status = <Table.Cell collapsing positive><Icon name='checkmark'/></Table.Cell>;
        } else {
            public_status = <Table.Cell collapsing negative><Icon name='x'/></Table.Cell>;
        }
    }

    return <Table.Row>
        <Table.Cell>{props.list.name}</Table.Cell>
        {public_status}
        <Table.Cell collapsing>{props.list.questions.length}</Table.Cell>
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

class QuestionListRenderer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            show: null,
            edit: false,
        };
    }

    questionListTable() {
        const table = this;
        const rows = this.props.questionList.map(l => {
            return <QuestionListEntry {...table.props} key={l.uuid} list={l} onShow={() => {
                table.setState({
                    show: l,
                    edit: false
                });
            }} onEdit={() => {
                table.setState({
                    show: l,
                    edit: true
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
            if (!this.state.show) {
                return <div>
                    {this.props.questionList.length === 0 ?
                        <p>Keine Fragenlisten vorhanden</p> : this.questionListTable()}

                    {this.props.allowEdit && <Button icon labelPosition='left' color='green'>
                        <Icon name='add'/>
                        Neue Fragenliste erstellen
                    </Button>}
                </div>;
            } else {
                let onClose = () => {
                    this.setState({
                        show: null,
                        edit: false
                    });
                };

                if (this.state.edit) {
                    return <Loader active={true} inline="centered"/>;
                } else {
                    const questions = this.state.show.questions.map(q => {
                        let question = findQuestion(this.props.questionDatabase, q);
                        if (question) {
                            return <QuestionRORenderer question={question} correctAnswer={-1} key={q}/>;
                        } else {
                            return <p key={q}>Frage {q} konnte nicht gefunden werden!</p>;
                        }
                    });
                    return <Modal
                        trigger={<Button onClick={this.handleOpen}>Show Modal</Button>}
                        open={true}
                        onClose={onClose}
                        size='small'
                        closeIcon>
                        <Modal.Header>Liste anzeigen</Modal.Header>
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
                }
            }
        } else {
            return <Loader active={true} inline="centered"/>;
        }
    }
}

QuestionListRenderer.propTypes = {
    questionDatabase: PropTypes.object.isRequired,
    questionList: PropTypes.array,
    allowEdit: PropTypes.bool,
    publicLists: PropTypes.bool,
};

QuestionListRenderer.defaultProps = {
    allowEdit: false,
    publicLists: true,
};

export default QuestionListRenderer;
