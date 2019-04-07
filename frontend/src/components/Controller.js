import React from 'react';

import App from './App';
import {updateState, UserActions} from "../util/actions";

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

export {AppModes};

class Controller extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mode: AppModes.CONNECTING,
            rooms: [],

            roomName: "",
            loggedIn: false,

            questionDatabase: {},
            nextKeepAliveTimeout: null,
            errorMessage: "",

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
        } else {
            this.setState({
                mode: AppModes.FATAL_ERROR,
                errorMessage: "Unbekannte Nachricht vom Server erhalten",
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
        return <App appState={this.state} mathJaxProvider={this.props.mathJaxProvider}
                    footerLink={this.props.footerLink} release={this.props.release} color={this.props.color}/>;
    }
}

export default Controller;
