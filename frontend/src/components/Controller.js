import React from 'react';
import PropTypes from 'prop-types';

import App from './App';
import {updateState} from "../util/actions";
import {preprocessQuestionDatabase} from "../util/util";

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

    LOGGED_IN: 40,

    ROOM_MASTER: 50,

    CREATE_LIST_FAILED: 90,

    FATAL_ERROR: 100,
});

const RoomMasterModes = Object.freeze({
    IDLE: 1,
    SETTINGS: 2,
    RUNNING: 3,
    RESULTS: 4,
});

const RoomModes = Object.freeze({
    IDLE: 0,
    QUESTION: 1,
    RESULTS: 2,
});

export {AppModes, RoomMasterModes, RoomModes};

class Controller extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // Globals
            mode: AppModes.CONNECTING,
            rooms: [],
            questionDatabase: {},
            myQuestionLists: null,
            publicQuestionLists: null,

            // Room
            roomName: "",
            roomUUID: "",
            roomState: null,

            // Answer
            selectedAnswer: -1,

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
        const data = JSON.parse(msg);
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
            const next = data.KeepAlive.next;

            if (this.state.nextKeepAliveTimeout) {
                clearTimeout(this.state.nextKeepAliveTimeout);
            }

            this.setState({
                nextKeepAliveTimeout: setTimeout(this.timeout.bind(this), next)
            });
        } else if (data.hasOwnProperty("LoginResult")) {
            const result = data.LoginResult;
            if (result) {
                this.setState({
                    mode: AppModes.LOGGED_IN,
                    loggedIn: true,
                });
            } else {
                this.setState({
                    mode: AppModes.LOGIN_FAILED,
                    loggedIn: false,
                });
            }
        } else if (data.hasOwnProperty("QuestionDatabase")) {
            const questionDatabase = preprocessQuestionDatabase(data.QuestionDatabase);

            this.setState({
                questionDatabase: questionDatabase,
            });
        } else if (data.hasOwnProperty("CreateRoomResult")) {
            const result = data.CreateRoomResult.success;
            const uuid = data.CreateRoomResult.uuid;

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
        } else if (data.hasOwnProperty("JoinRoomResult")) {
            const result = data.JoinRoomResult;
            if (result) {
                this.setState({
                    mode: AppModes.ROOM_JOINED,
                    selectedAnswer: -1,
                });
            } else {
                this.setState({
                    mode: AppModes.JOIN_ROOM_FAILED,
                    roomName: "",
                    roomUUID: "",
                });
            }
        } else if (data.hasOwnProperty("Error")) {
            this.setState({
                mode: AppModes.FATAL_ERROR,
                errorMessage: data.Error.message
            });
        } else if (data === "LeaveRoom" || data.hasOwnProperty("LeaveRoom")) {
            this.setState({
                mode: AppModes.REMOVED_FROM_ROOM,
                roomName: "",
                roomUUID: "",
                roomState: null,
                selectedAnswer: -1,
            });
        } else if (data.hasOwnProperty("RoomState")) {
            this.setState(state => {
                let masterMode = state.roomMasterMode;
                let selectedAnswer = state.selectedAnswer;

                if (state.loggedIn) {
                    selectedAnswer = -1;
                    switch (data.RoomState.state) {
                        case RoomModes.IDLE:
                            if (masterMode > RoomMasterModes.SETTINGS) {
                                masterMode = RoomMasterModes.IDLE;
                            }
                            break;
                        case RoomModes.QUESTION:
                            masterMode = RoomMasterModes.RUNNING;
                            break;
                        case RoomModes.RESULTS:
                            masterMode = RoomMasterModes.RESULTS;
                            break;
                        default:
                            this.setState({
                                mode: AppModes.FATAL_ERROR,
                                errorMessage: "Invalid RoomState: " + data.RoomState.state
                            });
                            return;
                    }
                }

                const hadState = Boolean(state.roomState && state.roomState.state);
                const hadQuestion = Boolean(hadState && state.roomState.question);
                const hadNonEmptyQuestion = Boolean(hadQuestion && state.roomState.question.uuid);

                const hasQuestion = Boolean(data.RoomState.question);
                const hasNonEmptyQuestion = Boolean(hasQuestion && data.RoomState.question.uuid);

                const comingFromIdle = data.RoomState.state < RoomModes.QUESTION;
                const comingFromResults = hadState && (data.RoomState.state === RoomModes.QUESTION && state.roomState.state === RoomModes.RESULTS);
                const questionRemoved = hadQuestion && !hasQuestion;
                const newQuestion = hasQuestion && !hadQuestion;
                let questionChanged = false;
                if (hadQuestion && hasQuestion) {
                    if (hadNonEmptyQuestion && !hasNonEmptyQuestion) {
                        questionChanged = true;
                    } else if (!hadNonEmptyQuestion && hasNonEmptyQuestion) {
                        questionChanged = true;
                    } else if (hadNonEmptyQuestion && hasNonEmptyQuestion) {
                        questionChanged = data.RoomState.question.uuid !== state.roomState.question.uuid;
                    }
                }

                if (comingFromIdle || comingFromResults || questionRemoved || newQuestion || questionChanged) {
                    selectedAnswer = -1;
                }

                return {
                    roomState: data.RoomState,
                    roomMasterMode: masterMode,
                    selectedAnswer: selectedAnswer,
                }
            });
        } else if (data.hasOwnProperty("PublicQuestionLists")) {
            this.setState({
                publicQuestionLists: data.PublicQuestionLists,
            });
        } else if (data.hasOwnProperty("UserQuestionLists")) {
            this.setState({
                myQuestionLists: data.UserQuestionLists,
            });
        } else if (data.hasOwnProperty("CreateQuestionListResult")) {
            if (!data.CreateQuestionListResult.success) {
                this.setState({
                    mode: AppModes.CREATE_LIST_FAILED,
                });
            }
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
        this.setState(state => {
            if (state.mode !== AppModes.FATAL_ERROR) {
                return {
                    mode: AppModes.FATAL_ERROR,
                    errorMessage: "Die Verbindung zum Server ist unerwartet abgebrochen (Timeout)."
                };
            }
        });
    }

    render() {
        return <App appState={this.state} {...this.props}/>;
    }
}

Controller.propTypes = {
    socketUrl: PropTypes.string.isRequired,
    mathJaxProvider: PropTypes.string.isRequired,
    footerLink: PropTypes.node.isRequired,
    release: PropTypes.bool.isRequired,
    color: PropTypes.string.isRequired,
};

export default Controller;
