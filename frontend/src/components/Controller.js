import React from 'react';

import App from './App';
import {updateState} from "../util/actions";

const AppModes = Object.freeze({
    CONNECTING: 1,
    LOADING_ROOMS: 2,
    JOINING_ROOM: 3,
    LOGGING_IN: 4,
    CREATING_ROOM: 5,

    JOIN_ROOM_FAILED: 10,
    LOGIN_FAILED: 11,
    CREATE_ROOM_FAILED: 12,
    REMOVED_FROM_ROOM: 13,

    START_PAGE: 20,

    ROOM_JOINED: 30,

    CREATE_ROOM: 40,

    ROOM_MASTER: 50,

    FATAL_ERROR: 100,
});

const RoomMasterModes = {
    IDLE: 1,
    SETTINGS: 2,
    RUNNING: 3,
    RESULTS: 4,
};

export {RoomMasterModes, AppModes};

class Controller extends React.Component {
    constructor(props) {
        super(props);

        // React doesn't like nested states. :(
        this.state = {
            // Globals
            mode: AppModes.CONNECTING,
            rooms: [],
            questionDatabase: {},

            // Room
            roomName: "",
            roomUUID: "",
            usersOnline: 0,
            usersAnswered: 0,

            // Question
            currentQuestion: null,

            // Admin
            loggedIn: false,
            roomMasterMode: RoomMasterModes.IDLE,
            initialQuestionLength: 0,
            remainingQuestions: 0,

            // Util
            nextKeepAliveTimeout: null,
            errorMessage: "",

            // Action handler
            actionHandler: this.handleAction.bind(this)
        };

        this.socket = new WebSocket(props.socketUrl);
        let app = this;
        this.socket.onopen = () => {
            app.setState({
                mode: AppModes.LOADING_ROOMS
            });
        };

        this.socket.onclose = () => {
            window.setTimeout(function () {
                app.setState({
                    mode: AppModes.FATAL_ERROR,
                    errorMessage: "Die Verbindung zum Server wurde beendet"
                });
            }, 1000);
        };

        this.socket.onerror = () => {
            app.setState({
                mode: AppModes.FATAL_ERROR,
                errorMessage: "Die Verbindung zum Server ist fehlgeschlagen"
            });
        };

        this.socket.onmessage = function (e) {
            if (!app.props.release) {
                console.log("Received", e.data);
            }
            app.handleSocketMessage(e.data);
        };
    }

    handleAction(action) {
        if (!this.props.release) {
            console.log("Action", action);
        }

        updateState(action, this.setState.bind(this), this.socket);
    }

    handleSocketMessage(msg) {
        let data = JSON.parse(msg);
        if (data.hasOwnProperty("RoomList")) {
            let newMode = this.state.mode;

            if (this.state.mode === AppModes.LOADING_ROOMS) {
                // Go to start page after initial room loading
                newMode = AppModes.START_PAGE;
            }

            this.setState({
                mode: newMode,
                rooms: data.RoomList,
            });
        } else if (data.hasOwnProperty("KeepAlive")) {
            let next = data.KeepAlive.next;

            if (this.state.nextKeepAliveTimeout) {
                clearTimeout(this.state.nextKeepAliveTimeout);
            }

            this.setState({
                nextKeepAliveTimeout: setTimeout(this.timeout.bind(this), next)
            });
        } else if (data.hasOwnProperty("LoginResult")) {
            let result = data.LoginResult;
            if (result) {
                this.setState({
                    mode: AppModes.CREATE_ROOM,
                    loggedIn: true,
                });
            } else {
                this.setState({
                    mode: AppModes.LOGIN_FAILED,
                    loggedIn: false,
                });
            }
        } else if (data.hasOwnProperty("QuestionDatabase")) {
            this.setState({
                questionDatabase: data.QuestionDatabase,
            });
        } else if (data.hasOwnProperty("CreateRoomResult")) {
            let result = data.CreateRoomResult.success;
            let uuid = data.CreateRoomResult.uuid;

            if (result) {
                this.setState({
                    mode: AppModes.ROOM_MASTER,
                    roomUUID: uuid,
                    roomMasterMode: RoomMasterModes.IDLE,
                });
            } else {
                this.setState({
                    mode: AppModes.CREATE_ROOM_FAILED,
                    roomName: "",
                    roomUUID: "",
                });
            }
        } else if (data.hasOwnProperty("Error")) {
            this.setState({
                mode: AppModes.FATAL_ERROR,
                errorMessage: data.message
            })
        } else {
            let errorMessage = "Unbekannte Nachricht vom Server erhalten";
            if (!this.props.release) {
                errorMessage += ": " + msg;
            }
            this.setState({
                mode: AppModes.FATAL_ERROR,
                errorMessage: errorMessage
            })
        }
    }

    timeout() {
        this.setState({
            mode: AppModes.ERROR,
            errorMessage: "Die Verbindung zum Server ist unerwartet abgebrochen (Timeout)."
        });
    }

    render() {
        return <App appState={this.state} {...this.props}/>;
    }
}

export default Controller;
