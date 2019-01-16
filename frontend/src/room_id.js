import React from "react";

import {
    Button,
    Container,
    Tab,
    Dropdown,
    Input,
} from "semantic-ui-react"

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
        let room = this.props.rooms.find(r => r.uuid === value.value);
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
        let room_options = [
            {
                text: "Kein Raum ausgewählt",
                value: ""
            }
        ].concat(this.props.rooms.map(r => {
            return {
                text: r.name + " (" + r.users + " Benutzer)",
                value: r.uuid,
                icon: r.password_required === true ? "lock" : "lock open"
            };
        }));

        let joinRoomUUID = this.state.joinRoomUUID;
        let existingRoom = this.props.rooms.find(r => r.uuid === joinRoomUUID);
        if (!existingRoom) {
            joinRoomUUID = "";
        }

        let tabPanes = [
            {
                menuItem: "Raum beitreten",
                render: () => <Tab.Pane>
                    <Dropdown placeholder="Raum auswählen" fluid selection options={room_options}
                              value={joinRoomUUID} onChange={this.handleJoinRoomChange.bind(this)}/>
                    <br/>
                    <RenderPasswordBox show={this.state.roomRequiresPassword && joinRoomUUID !== ""}
                                       onChange={this.handleNewRoomPasswordMessage.bind(this)}/>

                    <Button disabled={joinRoomUUID === ""} color={this.props.color} fluid size="large"
                            onClick={() => {
                                let roomName = this.props.rooms.find(r => r.uuid === joinRoomUUID).name;
                                this.props.onRoomJoin(joinRoomUUID, this.state.roomPassword, roomName);
                            }}>
                        <Button.Content visible>Raum beitreten</Button.Content>
                    </Button>
                </Tab.Pane>
            },
            {
                menuItem: "Login", render: () => <Tab.Pane>
                    <Input fluid icon="user" iconPosition="left" placeholder={"Benutzername"}
                           onChange={this.handleNewUsernameMessage.bind(this)}/><br/>
                    <Input fluid icon="key" iconPosition="left" placeholder={"Passwort"} type="password"
                           onChange={this.handleNewPasswordMessage.bind(this)}/><br/>

                    <Button color={this.props.color} fluid size="large" onClick={() => {
                        this.props.onLogin(this.state.username, this.state.password);
                    }}>
                        <Button.Content visible>Login</Button.Content>
                    </Button>
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

export default RoomID;
