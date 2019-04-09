import React from 'react';
import {Button, Checkbox, Form, Header, Icon, Segment} from "semantic-ui-react";
import {backToIdle} from "../../util/actions";

class QuestionSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shuffle: true,
            outdated: false,
        }
    }

    toggleShuffle() {
        this.setState(state => {
            return {
                shuffle: !state.shuffle,
            }
        })
    }

    toggleOutdated() {
        this.setState(state => {
            return {
                outdated: !state.outdated,
            }
        })
    }

    render() {
        return <Segment>
            <Header as="h1">Einstellungen</Header>
            <Form>
                <Form.Field>
                    <Checkbox label={{children: "Fragen mischen"}} checked={this.state.shuffle}
                              onChange={this.toggleShuffle.bind(this)}/><br/>
                    <Checkbox label={{children: "Nicht mehr relevante Fragen stellen"}}
                              checked={this.state.outdated}
                              onChange={this.toggleOutdated.bind(this)}/>
                </Form.Field>

                <Button.Group>
                    <Button color="red" icon labelPosition="left"
                            onClick={() => this.props.appState.actionHandler(backToIdle())}>
                        <Button.Content visible>Zurück</Button.Content>
                        <Icon name="chevron left"/>
                    </Button>
                    <Button color="green" icon labelPosition="right"
                            onClick={() => {
                                this.props.startQuestions(this.state.shuffle, this.state.outdated)
                            }}>
                        <Button.Content visible>Starten</Button.Content>
                        <Icon name="play"/>
                    </Button>
                </Button.Group>
            </Form>
        </Segment>;
    }
}

export default QuestionSettings;
