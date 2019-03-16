import React, {Component} from "react";
import AppHeader from "./header";
import AppFooter from "./footer";
import MainContent from "./main_content";
import MathJax from "react-mathjax";
import {ltrim} from "../util";
import {Responsive} from "semantic-ui-react";

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

const RoomMasterModes = {
    IDLE: 1,
    SETTINGS: 2,
    RUNNING: 3,
    RESULTS: 4,
};

export {RoomMasterModes};

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: AppModes.CONNECTING,
            rooms: [],
            socket: new WebSocket(props.socketUrl),
            roomState: 0,
            selectedAnswer: -1,
            roomName: "",
            roomQuestion: {},
            roomResults: {},
            questionDatabase: {},
            questionUserState: {
                selected: 0,
                total: 0,
            },
            roomUUID: "",
            errorMessage: "",
            loggedIn: false,
            roomMaster: this.getEmptyRoomMaster(),
            questionProgress: {
                remainingQuestions: 0,
                initialQuestionLength: 0,
            },
            nextKeepAliveTimeout: null,
        };

        let app = this;
        let socket = this.state.socket;

        socket.onopen = () => {
            app.setState({
                mode: AppModes.LOADING_ROOMS
            });
        };

        socket.onclose = () => {
            window.setTimeout(function () {
                app.setState({
                    mode: AppModes.FATAL_ERROR,
                    errorMessage: "Die Verbindung zum Server wurde beendet"
                });
            }, 1000);
        };

        socket.onerror = () => {
            app.setState({
                mode: AppModes.FATAL_ERROR,
                errorMessage: "Die Verbindung zum Server ist fehlgeschlagen"
            });
        };

        socket.onmessage = function (e) {
            if (!app.props.release) {
                console.log("Received: " + e.data);
            }
            app.parseMessage(app, e.data);
        };
    }

    startQuestionsRequest() {
        this.state.socket.send(JSON.stringify({
            StartQuestions: {
                mode: this.state.roomMaster.startUUID !== "" ? "uuid" : "plain",
                start_uuid: this.state.roomMaster.startUUID,
                shuffle: this.state.roomMaster.shuffleQuestions,
                ignore_outdated: !this.state.roomMaster.showObsoleteQuestions,
            }
        }));
    }

    showResultsRequest() {
        this.state.socket.send(JSON.stringify("ShowResults"));
    }

    nextQuestionRequest() {
        this.state.socket.send(JSON.stringify("NextQuestion"));
    }

    endQuestionsRequest() {
        this.setState({
            roomMaster: {
                ...this.state.roomMaster,
                searchInput: "",
            }
        });
        this.state.socket.send(JSON.stringify("EndQuestions"));
    }

    toggleShuffleQuestions() {
        this.setState({
            roomMaster: {
                ...this.state.roomMaster,
                shuffleQuestions: !this.state.roomMaster.shuffleQuestions,
            }
        });
    }

    toggleOutdatedQuestions() {
        this.setState({
            roomMaster: {
                ...this.state.roomMaster,
                showObsoleteQuestions: !this.state.roomMaster.showObsoleteQuestions,
            }
        });
    }

    setStartUUID(uuid, single, callback) {
        this.setState({
            roomMaster: {
                ...this.state.roomMaster,
                mode: single ? RoomMasterModes.RUNNING : RoomMasterModes.SETTINGS,
                startUUID: uuid,
                singleUUID: single,
            }
        }, callback);
    }

    setSearchInput(input) {
        this.setState({
            roomMaster: {
                ...this.state.roomMaster,
                searchInput: ltrim(input.target.value.toLowerCase()),
            }
        });
    }

    setBackToIdle() {
        this.setState({
            roomMaster: {
                ...this.state.roomMaster,
                mode: RoomMasterModes.IDLE,
            }
        });
    }

    getEmptyRoomMaster() {
        return {
            mode: RoomMasterModes.IDLE,
            searchInput: "",
            startUUID: "",
            singleUUID: false,
            shuffleQuestions: true,
            showObsoleteQuestions: false,
            startQuestions: this.startQuestionsRequest.bind(this),
            showResults: this.showResultsRequest.bind(this),
            nextQuestion: this.nextQuestionRequest.bind(this),
            endQuestions: this.endQuestionsRequest.bind(this),
            toggleShuffle: this.toggleShuffleQuestions.bind(this),
            toggleOutdated: this.toggleOutdatedQuestions.bind(this),
            setStartUUID: this.setStartUUID.bind(this),
            setSearchInput: this.setSearchInput.bind(this),
            backToIdle: this.setBackToIdle.bind(this),
        };
    }

    timeout() {
        this.setState({
            mode: AppModes.ERROR,
            errorMessage: "Die Verbindung zum Server ist abgebrochen."
        });
    }

    parseMessage(app, msg) {
        let data = JSON.parse(msg);
        if (data.RoomList) {
            app.setState({
                rooms: data.RoomList,
            });

            if (app.state.mode === AppModes.LOADING_ROOMS) {
                app.setState({
                    mode: AppModes.START_PAGE,
                });
            }
        } else if (data.hasOwnProperty("JoinRoomResult")) {
            let result = data.JoinRoomResult;
            if (result) {
                app.setState({
                    mode: AppModes.ROOM_JOINED,
                    roomState: 0,
                });
            } else {
                app.setState({
                    mode: AppModes.JOIN_ROOM_FAILED,
                });
            }
        } else if (data.RoomState) {
            let mode = null;
            switch (data.RoomState.state) {
                default:
                case 0:
                    if (app.state.roomMaster.mode > RoomMasterModes.SETTINGS) {
                        mode = RoomMasterModes.IDLE;
                    }
                    break;
                case 1:
                    mode = RoomMasterModes.RUNNING;
                    break;
                case 2:
                    mode = RoomMasterModes.RESULTS;
            }
            if (mode === null) {
                mode = app.state.roomMaster.mode;
            }

            let selectedAnswer = app.state.selectedAnswer;
            if (data.RoomState.state < 1 || (data.RoomState.state === 1 && app.state.roomState === 2)
                || (data.RoomState.question && app.state.roomQuestion && data.RoomState.question.uuid !== app.state.roomQuestion.uuid)
                || (!data.RoomState.question && app.state.roomQuestion)
                || (data.RoomState.question && !app.state.roomQuestion)) {
                selectedAnswer = -1;
            }

            app.setState({
                roomMaster: {
                    ...app.state.roomMaster,
                    mode: mode,
                },
                roomQuestion: data.RoomState.question,
                roomResults: data.RoomState.results,
                roomState: data.RoomState.state,
                selectedAnswer: selectedAnswer,
                questionProgress: {
                    remainingQuestions: data.RoomState.remainingQuestions,
                    initialQuestionLength: data.RoomState.initialQuestionLength,
                },
                questionUserState: data.RoomState.user_state,
            });
        } else if (data === "LeaveRoom" || data.LeaveRoom) {
            app.leaveRoom();
        } else if (data.hasOwnProperty("LoginResult")) {
            let result = data.LoginResult;
            if (result) {
                app.setState({
                    mode: AppModes.CREATE_ROOM,
                    loggedIn: true,
                });
            } else {
                app.setState({
                    mode: AppModes.LOGIN_FAILED,
                    loggedIn: false,
                });
            }
        } else if (data.QuestionDatabase) {
            app.setState({
                questionDatabase: data.QuestionDatabase,
            });
        } else if (data.CreateRoomResult) {
            let result = data.CreateRoomResult.success;
            let uuid = data.CreateRoomResult.uuid;

            if (result) {
                app.setState({
                    mode: AppModes.ROOM_MASTER,
                    roomUUID: uuid,
                });
            } else {
                app.setState({
                    mode: AppModes.CREATE_ROOM_FAILED,
                    roomName: "",
                });
            }
        } else if (data.KeepAlive) {
            let next = data.KeepAlive.next;

            if (this.state.nextKeepAliveTimeout) {
                clearTimeout(this.state.nextKeepAliveTimeout);
            }

            this.setState({
                nextKeepAliveTimeout: setTimeout(this.timeout.bind(this), next)
            });
        } else {
            app.setState({
                mode: AppModes.ERROR,
                errorMessage: "Unbekannte Nachricht vom Server erhalten"
            });
        }
    }

    leaveRoom() {
        this.setState({
            mode: AppModes.REMOVED_FROM_ROOM,
            roomName: "",
            roomMaster: this.getEmptyRoomMaster(),
        });
    }

    joinRoom(uuid, password, roomName) {
        this.setState({
            mode: AppModes.JOINING_ROOM,
            roomName: roomName,
            roomMaster: this.getEmptyRoomMaster(),
            selectedAnswer: -1,
        });
        this.state.socket.send(JSON.stringify({
            JoinRoom: {
                room_uuid: uuid,
                password: password,
            }
        }));
    }

    selectAnswer(answer) {
        this.setState({
            selectedAnswer: answer,
        });
        this.state.socket.send(JSON.stringify({
            AnswerQuestion: {
                id: answer,
            }
        }));
    }

    handleBackToSelect() {
        this.setState({
            mode: AppModes.START_PAGE,
        });
    }

    handleBackToCreate() {
        this.setState({
            mode: AppModes.CREATE_ROOM,
        });
    }

    leaveRoomRequest() {
        this.state.socket.send(JSON.stringify("LeaveRoom"));
        this.setState({
            mode: this.state.loggedIn ? AppModes.CREATE_ROOM : AppModes.START_PAGE,
            roomName: "",
            roomState: 0,
            selectedAnswer: -1,
        });
    }

    loginRequest(username, password) {
        this.state.socket.send(JSON.stringify({
            Login: {
                username: username,
                password: password,
            }
        }));
        this.setState({
            mode: AppModes.LOGGING_IN,
        });
    }

    createRoomRequest(roomName, password) {
        this.state.socket.send(JSON.stringify({
            CreateRoom: {
                room_name: roomName,
                password: password,
            }
        }));
        this.setState({
            mode: AppModes.CREATING_ROOM,
            roomName: roomName,
            roomMaster: this.getEmptyRoomMaster(),
        });
    }

    render() {
        return (
            <div>
                <MathJax.Provider script={this.props.mathJaxProvider}>
                    <AppHeader roomName={this.state.roomName}/>
                    <div style={{height: "4em"}}/>
                    <Responsive {...Responsive.onlyComputer}>
                        <div style={{height: "2em"}}/>
                    </Responsive>

                    <MainContent mode={this.state.mode} errorMessage={this.state.errorMessage} color={this.props.color}
                                 rooms={this.state.rooms} onRoomJoin={this.joinRoom.bind(this)}
                                 onBackToSelect={this.handleBackToSelect.bind(this)}
                                 selectedAnswer={this.state.selectedAnswer}
                                 onBackToCreate={this.handleBackToCreate.bind(this)} roomName={this.state.roomName}
                                 roomState={this.state.roomState} roomQuestion={this.state.roomQuestion}
                                 roomResults={this.state.roomResults} selectAnswer={this.selectAnswer.bind(this)}
                                 leaveRoom={this.leaveRoomRequest.bind(this)} onLogin={this.loginRequest.bind(this)}
                                 questionDatabase={this.state.questionDatabase}
                                 questionUserState={this.state.questionUserState}
                                 onCreateRoom={this.createRoomRequest.bind(this)}
                                 roomMaster={this.state.roomMaster} questionProgress={this.state.questionProgress}/>
                    <div style={{height: "5em"}}/>
                    <AppFooter version={"0.3.0"} footerLink={this.props.footerLink}/>
                </MathJax.Provider>
            </div>
        );
    }
}

export default App;
