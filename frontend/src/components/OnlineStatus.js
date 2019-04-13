import React from 'react';
import PropTypes from 'prop-types';
import {Icon, Label} from "semantic-ui-react";

class OnlineStatus extends React.Component {
    render() {
        let usersOnline = null;
        let usersAnswered = null;
        if (this.props.appState.roomState && this.props.appState.roomState.userState) {
            usersOnline = this.props.appState.roomState.userState.total;
            usersAnswered = this.props.appState.roomState.userState.selected;
        } else if (this.props.appState.roomUUID) {
            const thisRoom = this.props.appState.rooms.find(r => r.uuid === this.props.appState.roomUUID);
            if (thisRoom) {
                usersOnline = (thisRoom.users - 1);
            }
        }

        if (usersAnswered !== null) {
            return <div id="onlineStatus">
                <Label title="Benutzer online">
                    <Icon name='users'/> {usersOnline}
                </Label>
                <Label title="Frage beantwortet von">
                    <Icon name='write'/> {usersAnswered}
                </Label>
            </div>;
        } else if (usersOnline !== null) {
            return <div id="onlineStatus">
                <Label title="Benutzer online">
                    <Icon name='users'/> {usersOnline}
                </Label>
            </div>;
        } else {
            return null;
        }
    }
}

OnlineStatus.propTypes = {
    appState: PropTypes.object.isRequired,
};

export default OnlineStatus;
