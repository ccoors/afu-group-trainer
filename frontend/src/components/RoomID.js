import React from 'react';
import PropTypes from 'prop-types';

import {Button, Container, Dropdown, Form, Input, Tab,} from "semantic-ui-react"
import {joinRoom, login} from "../util/actions";

class RenderPasswordBox extends React.Component {
    render() {
        if (this.props.show) {
            return <div><Input fluid icon="key" iconPosition="left" placeholder="Passwort" type="password"
                               onChange={this.props.onChange}/><br/>
            </div>;
        }
        return <div/>;
    }
}

RenderPasswordBox.propTypes = {
    show: PropTypes.bool,
    onChange: PropTypes.func,
};

class RoomID extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            joinRoomUUID: "",
            roomRequiresPassword: false,
            username: "",
            password: "",
            roomPassword: "",
        };
    }

    handleNewUsernameMessage(e) {
        this.setState({
            username: e.target.value
        });
    }

    handleNewPasswordMessage(e) {
        this.setState({
            password: e.target.value
        });
    }

    handleNewRoomPasswordMessage(e) {
        this.setState({
            roomPassword: e.target.value
        });
    }

    handleJoinRoomChange(e, value) {
        let room = this.props.appState.rooms.find(r => r.uuid === value.value);
        if (!room) {
            room = {
                password_required: false,
            }
        }
        console.log(room);
        this.setState({
            joinRoomUUID: value.value,
            roomPassword: "",
            roomRequiresPassword: room.password_required,
        });
    }

    render() {
        const hasRooms = this.props.appState.rooms.length > 0;

        let room_options = this.props.appState.rooms.map(r => {
            return {
                text: r.name + " (" + r.users + " Benutzer)",
                value: r.uuid,
                icon: r.password_required === true ? "lock" : "lock open"
            };
        });

        if (!hasRooms) {
            room_options = [{
                text: "Kein Raum verfügbar",
                value: ""
            }];
        }

        let joinRoomUUID = this.state.joinRoomUUID;
        const existingRoom = this.props.appState.rooms.find(r => r.uuid === joinRoomUUID);
        if (!existingRoom) {
            joinRoomUUID = "";
        }
        if (joinRoomUUID === "" && hasRooms) {
            joinRoomUUID = this.props.appState.rooms[0].uuid;
        }

        let tabPanes = [
            {
                menuItem: {key: "joinRoom", content: "Raum beitreten", icon: "users"},
                render: () => <Tab.Pane>
                    <Dropdown placeholder="Raum auswählen" fluid selection options={room_options}
                              value={joinRoomUUID} onChange={this.handleJoinRoomChange.bind(this)}/>
                    <br/>
                    <RenderPasswordBox show={this.state.roomRequiresPassword && joinRoomUUID !== ""}
                                       onChange={this.handleNewRoomPasswordMessage.bind(this)}/>

                    <Button disabled={joinRoomUUID === ""} color={this.props.color} fluid size="large"
                            onClick={() => {
                                let roomName = this.props.appState.rooms.find(r => r.uuid === joinRoomUUID).name;
                                let action = joinRoom(roomName, joinRoomUUID, this.state.roomPassword);
                                this.props.appState.actionHandler(action);
                            }}>
                        <Button.Content visible>Raum beitreten</Button.Content>
                    </Button>
                </Tab.Pane>
            },
            {
                menuItem: {key: "login", content: "Login", icon: "sign-in"},
                render: () => <Tab.Pane>
                    <Form>
                        {this.props.demo && <p className={"noTopMargin"}>
                            Demoinstanz: Login mit Benutzername <strong>demo</strong> und Passwort <strong>demo</strong>
                        </p>}

                        <Input fluid icon="user" iconPosition="left" placeholder={"Benutzername"}
                               onChange={this.handleNewUsernameMessage.bind(this)}/><br/>
                        <Input fluid icon="key" iconPosition="left" placeholder={"Passwort"} type="password"
                               onChange={this.handleNewPasswordMessage.bind(this)}/><br/>

                        <Button color={this.props.color} fluid size="large" type="submit" onClick={() => {
                            let action = login(this.state.username, this.state.password);
                            this.props.appState.actionHandler(action);
                        }}>
                            <Button.Content visible>Login</Button.Content>
                        </Button>
                    </Form>
                </Tab.Pane>
            },
        ];

        return (
            <Container text>
                <Tab panes={tabPanes}/>
            </Container>
        );
    }
}

RoomID.propTypes = {
    appState: PropTypes.object.isRequired,
    color: PropTypes.string.isRequired,
};

export default RoomID;
