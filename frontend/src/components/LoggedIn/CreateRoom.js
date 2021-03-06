import PropTypes from 'prop-types';
import React from 'react';

import { Button, Form, Header, Input } from 'semantic-ui-react';
import { createRoom } from '../../util/actions';

class CreateRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      createRoomName: '',
      createRoomPassword: '',
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
      <div>
        <Header as="h1" content="Raum erstellen" />
        <Form>
          <Input fluid icon="pencil" iconPosition="left" placeholder="Raumname"
                 onChange={this.handleNewRoomName.bind(this)} /><br />
          <Input fluid icon="key" iconPosition="left" placeholder="Passwort" type="password"
                 onChange={this.handleNewRoomPassword.bind(this)} />
          <p>Passwortfeld frei lassen, um Passwortschutz zu deaktivieren.</p><br />

          <Button color={this.props.color} fluid size="large" type="submit" onClick={(e) => {
            if (e) e.preventDefault();
            const action = createRoom(this.state.createRoomName, this.state.createRoomPassword);
            this.props.appState.actionHandler(action);
          }}>
            <Button.Content visible>Raum erstellen</Button.Content>
          </Button>
        </Form>
      </div>
    );
  }
}

CreateRoom.propTypes = {
  appState: PropTypes.object.isRequired,
  color: PropTypes.string.isRequired,
};

export default CreateRoom;
