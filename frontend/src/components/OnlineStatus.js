import PropTypes from 'prop-types';
import React from 'react';
import {Icon, Label, Popup} from 'semantic-ui-react';

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

        const onlineLabel = usersOnline !== null ? <div id="onlineStatus">
            <Popup trigger={<Label color='black'>
                <Icon name='users'/> {usersOnline}
            </Label>} content='Benutzer online'/>
        </div> : null;

        if (usersAnswered !== null) {
            return <div id="onlineStatus">
                {onlineLabel}
                <Popup trigger={<Label color='black' style={{marginRight: '1em'}}>
                    <Icon name='write'/> {usersAnswered}
                </Label>} content='Frage beantwortet von'/>
            </div>;
        } else if (usersOnline !== null) {
            return onlineLabel;
        } else {
            return null;
        }
    }
}

OnlineStatus.propTypes = {
    appState: PropTypes.object.isRequired,
};

export default OnlineStatus;
