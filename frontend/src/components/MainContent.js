import PropTypes from 'prop-types';
import React from 'react';

import {Loader} from 'semantic-ui-react'
import {backToLoggedIn, backToStart} from '../util/actions';

import {AppModes} from './Controller'
import FatalError from './FatalError';
import LoggedIn from './LoggedIn/LoggedIn';
import RecoverableError from './RecoverableError';

import RoomID from './RoomID';
import RoomJoined from './RoomJoined';
import RoomMaster from './RoomMaster/RoomMaster';

class MainContent extends React.Component {
    render() {
        switch (this.props.appState.mode) {
            case AppModes.CONNECTING:
                return (<Loader active={true}>Verbinde mit Server...</Loader>);
            case AppModes.LOADING_ROOMS:
                return (<Loader active={true}>Lade Daten...</Loader>);
            case AppModes.JOINING_ROOM:
                return (<Loader active={true}>Trete Raum bei...</Loader>);
            case AppModes.LOGGING_IN:
                return (<Loader active={true}>Einloggen...</Loader>);
            case AppModes.CREATING_ROOM:
                return (<Loader active={true}>Erstelle Raum...</Loader>);
            case AppModes.START_PAGE:
                return (<RoomID {...this.props}/>);
            case AppModes.JOIN_ROOM_FAILED:
                return (<RecoverableError message={'Konnte Raum nicht beitreten. Passwort falsch?'}
                                          onOk={() => this.props.appState.actionHandler(backToStart())}
                                          color={this.props.color}/>);
            case AppModes.LOGIN_FAILED:
                return (<RecoverableError message={'Login fehlgeschlagen. Passwort falsch?'}
                                          onOk={() => this.props.appState.actionHandler(backToStart())}
                                          color={this.props.color}/>);
            case AppModes.CREATE_ROOM_FAILED:
                return (<RecoverableError message={'Raum konnte nicht erstellt werden.'}
                                          onOk={() => this.props.appState.actionHandler(backToLoggedIn())}
                                          color={this.props.color}/>);
            case AppModes.REMOVED_FROM_ROOM:
                return (<RecoverableError
                    message={'Sie wurden aus dem Raum entfernt. Vermutlich wurde der Raum geschlossen.'}
                    onOk={() => this.props.appState.actionHandler(backToStart())} color={this.props.color}/>);
            case AppModes.ROOM_JOINED:
                return (<RoomJoined {...this.props}/>);
            case AppModes.LOGGED_IN:
                return (<LoggedIn {...this.props}/>);
            case AppModes.ROOM_MASTER:
                return (<RoomMaster {...this.props}/>);
            case AppModes.CREATE_LIST_FAILED:
                return (<RecoverableError message={'Liste konnte nicht erstellt werden.'}
                                          onOk={() => this.props.appState.actionHandler(backToLoggedIn())}
                                          color={this.props.color}/>);
            case AppModes.FATAL_ERROR:
            default:
                window.onbeforeunload = undefined;
                return <FatalError appState={this.props.appState}/>;
        }
    }
}

MainContent.propTypes = {
    appState: PropTypes.object.isRequired,
    color: PropTypes.string.isRequired,
};

export default MainContent;
