import PropTypes from 'prop-types';
import React from 'react';
import { Icon, Label, Popup } from 'semantic-ui-react';

class OnlineStatus extends React.Component {
  render() {
    let usersOnline = null;
    let usersAnswered = null;
    let countdown = null;

    if (this.props.appState.roomState && this.props.appState.roomState.hasOwnProperty('countdown') && this.props.appState.roomState.countdown) {
      countdown = (
        <Popup trigger={<Label color='red'>
          <Icon name='clock' /> {this.props.appState.roomState.countdown}
        </Label>} content='Countdown' />
      );
    }

    if (this.props.appState.roomState && this.props.appState.roomState.userState) {
      usersOnline = this.props.appState.roomState.userState.total;
      usersAnswered = this.props.appState.roomState.userState.selected;
    } else if (this.props.appState.roomUUID) {
      const thisRoom = this.props.appState.rooms.find(r => r.uuid === this.props.appState.roomUUID);
      if (thisRoom) {
        usersOnline = (thisRoom.users - 1);
      }
    }

    const onlineLabel = usersOnline !== null ? <Popup trigger={<Label color='black'>
      <Icon name='users' /> {usersOnline}
    </Label>} content='Benutzer online' /> : null;

    const answeredLabel = usersAnswered !== null ? <Popup trigger={<Label color='black'>
      <Icon name='write' /> {usersAnswered}
    </Label>} content='Frage beantwortet von' /> : null;

    return (
      <div id="onlineStatus">
        {countdown}
        {onlineLabel}
        {answeredLabel}
      </div>
    );
  }
}

OnlineStatus.propTypes = {
  appState: PropTypes.object.isRequired,
};

export default OnlineStatus;
