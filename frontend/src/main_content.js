import React from "react";

import {
    Button,
    Loader,
    Modal,
    Icon,
} from "semantic-ui-react"
import RoomID from "./room_id"
import RecoverableError from "./recoverable_error";
import RoomJoined from "./room_joined";
import CreateRoom from "./create_room";
import RoomMaster from "./room_master";

import {AppModes} from "./App"

class MainContent extends React.Component {
    render() {
        switch (this.props.mode) {
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
                return (<RoomID color={this.props.color} rooms={this.props.rooms} onRoomJoin={this.props.onRoomJoin}
                                onLogin={this.props.onLogin}/>);
            case AppModes.JOIN_ROOM_FAILED:
                return (<RecoverableError message={"Konnte Raum nicht beitreten. Passwort falsch?"}
                                          onOk={this.props.onBackToSelect} color={this.props.color}/>);
            case AppModes.LOGIN_FAILED:
                return (<RecoverableError message={"Login fehlgeschlagen. Passwort falsch?"}
                                          onOk={this.props.onBackToSelect} color={this.props.color}/>);
            case AppModes.CREATE_ROOM_FAILED:
                return (<RecoverableError message={"Raum konnte nicht erstellt werden."}
                                          onOk={this.props.onBackToCreate} color={this.props.color}/>);
            case AppModes.REMOVED_FROM_ROOM:
                return (<RecoverableError
                    message={"Sie wurden aus dem Raum entfernt. Vermutlich wurde der Raum geschlossen."}
                    onOk={this.props.onBackToSelect} color={this.props.color}/>);
            case AppModes.ROOM_JOINED:
                return (<RoomJoined roomName={this.props.roomName} roomState={this.props.roomState}
                                    roomQuestion={this.props.roomQuestion} roomResults={this.props.roomResults}
                                    selectAnswer={this.props.selectAnswer} leaveRoom={this.props.leaveRoom}
                                    questionProgress={this.props.questionProgress} color={this.props.color}
                                    selectedAnswer={this.props.selectedAnswer}/>);
            case AppModes.CREATE_ROOM:
                return (<CreateRoom color={this.props.color} onCreateRoom={this.props.onCreateRoom}/>);
            case AppModes.ROOM_MASTER:
                return (<RoomMaster roomName={this.props.roomName} questionDatabase={this.props.questionDatabase}
                                    leaveRoom={this.props.leaveRoom} color={this.props.color}
                                    roomQuestion={this.props.roomQuestion} roomResults={this.props.roomResults}
                                    roomMaster={this.props.roomMaster} questionProgress={this.props.questionProgress}/>);
            case AppModes.FATAL_ERROR:
            default:
                window.onbeforeunload = undefined;
                return (
                    <div>
                        <Modal basic defaultOpen={true} closeOnDocumentClick={false} closeOnDimmerClick={false}
                               closeIcon={false}>
                            <Modal.Header>Schwerwiegender Fehler</Modal.Header>
                            <Modal.Content>
                                <p>
                                    Es ist ein schwerwiegender Fehler aufgetreten.
                                </p>
                                <p>
                                    {this.props.errorMessage}
                                </p>
                            </Modal.Content>
                            <Modal.Actions>
                                <Button basic color="red" inverted onClick={() => document.location.reload(true)}>
                                    <Icon name="refresh"/> Seite neu laden
                                </Button>
                            </Modal.Actions>
                        </Modal>
                    </div>
                );
        }


    }
}

export default MainContent;
