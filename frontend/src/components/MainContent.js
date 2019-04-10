import React from "react";

import {Loader} from "semantic-ui-react"

import RoomID from "./RoomID";
import RecoverableError from "./RecoverableError";
import RoomJoined from "./RoomJoined";
import CreateRoom from "./CreateRoom";
import RoomMaster from "./RoomMaster/RoomMaster";
import FatalError from "./FatalError";

import {AppModes} from "./Controller"
import {backToCreateRoom, backToStart} from "../util/actions";

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
                return (<RecoverableError message={"Konnte Raum nicht beitreten. Passwort falsch?"}
                                          onOk={() => this.props.appState.actionHandler(backToStart())}
                                          color={this.props.color}/>);
            case AppModes.LOGIN_FAILED:
                return (<RecoverableError message={"Login fehlgeschlagen. Passwort falsch?"}
                                          onOk={() => this.props.appState.actionHandler(backToStart())}
                                          color={this.props.color}/>);
            case AppModes.CREATE_ROOM_FAILED:
                return (<RecoverableError message={"Raum konnte nicht erstellt werden."}
                                          onOk={() => this.props.appState.actionHandler(backToCreateRoom())}
                                          color={this.props.color}/>);
            case AppModes.REMOVED_FROM_ROOM:
                return (<RecoverableError
                    message={"Sie wurden aus dem Raum entfernt. Vermutlich wurde der Raum geschlossen."}
                    onOk={() => this.props.appState.actionHandler(backToStart())} color={this.props.color}/>);
            case AppModes.ROOM_JOINED:
                return (<RoomJoined roomName={this.props.roomName} roomState={this.props.roomState}
                                    roomQuestion={this.props.roomQuestion} roomResults={this.props.roomResults}
                                    selectAnswer={this.props.selectAnswer} leaveRoom={this.props.leaveRoom}
                                    questionProgress={this.props.questionProgress} color={this.props.color}
                                    selectedAnswer={this.props.selectedAnswer}/>);
            case AppModes.CREATE_ROOM:
                return (<CreateRoom {...this.props}/>);
            case AppModes.ROOM_MASTER:
                return (<RoomMaster {...this.props}/>);
            case AppModes.FATAL_ERROR:
            default:
                window.onbeforeunload = undefined;
                return (
                    <FatalError appState={this.props.appState}/>
                );
        }


    }
}

export default MainContent;
