import React from "react";

import {Button, Container, Header, Input, Segment,} from "semantic-ui-react"

class CreateRoom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            createRoomName: "",
            createRoomPassword: "",
        };
    }

    handleNewRoomName(e) {
        this.setState({
            createRoomName: e.target.value
        });
    }

    handleNewRoomPassword(e) {
        this.setState({
            createRoomPassword: e.target.value
        });
    }

    render() {
        return (
            <Container text>
                <Segment>
                    <Header as="h1" content="Raum erstellen"/>
                    <Input fluid icon="pencil" iconPosition="left" placeholder="Raumname"
                           onChange={this.handleNewRoomName.bind(this)}/><br/>
                    <Input fluid icon="key" iconPosition="left" placeholder="Passwort" type="password"
                           onChange={this.handleNewRoomPassword.bind(this)}/>
                    <p>Passwortfeld frei lassen um Passwortschutz zu deaktivieren.</p><br/>

                    <Button color={this.props.color} fluid size="large" onClick={() => {
                        this.props.onCreateRoom(this.state.createRoomName, this.state.createRoomPassword);
                    }}>
                        <Button.Content visible>Raum erstellen</Button.Content>
                    </Button>
                </Segment>
            </Container>
        );
    }
}

export default CreateRoom;
