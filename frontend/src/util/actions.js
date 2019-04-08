import {AppModes, RoomMasterModes} from "../components/Controller";

const UserActions = Object.freeze({
    BACK_TO_START: 1,
    JOIN_ROOM: 2,
    LOGIN: 3,
    BACK_TO_CREATE_ROOM: 4,

    SELECT_ANSWER: 10,

    CREATE_ROOM: 20,
    QUESTION_SETTINGS: 21,
    START_QUESTIONS: 25,
    NEXT_QUESTION: 26,
    END_QUESTIONS: 27,
    SHOW_RESULTS: 28,
    BACK_TO_IDLE: 29,

    LEAVE_ROOM: 30,
});

function backToStart() {
    return {
        action: UserActions.BACK_TO_START,
    };
}

function backToCreateRoom() {
    return {
        action: UserActions.BACK_TO_CREATE_ROOM,
    };
}

function joinRoom(roomName, uuid, password) {
    return {
        action: UserActions.JOIN_ROOM,
        roomName: roomName,
        roomUUID: uuid,
        password: password,
    };
}

function login(username, password) {
    return {
        action: UserActions.LOGIN,
        username: username,
        password: password,
    }
}

function selectAnswer(answer) {
    return {
        action: UserActions.SELECT_ANSWER,
        answer: answer
    };
}

function createRoom(roomName, password) {
    return {
        action: UserActions.CREATE_ROOM,
        roomName: roomName,
        password: password,
    };
}

function backToIdle() {
    return {
        action: UserActions.BACK_TO_IDLE,
    };
}

function questionSettings() {
    return {
        action: UserActions.QUESTION_SETTINGS,
    };
}

function startQuestions(uuid, single, shuffle, outdated) {
    return {
        action: UserActions.START_QUESTIONS,
        uuid: uuid,
        single: single,
        shuffle: shuffle,
        outdated: outdated,
    };
}

function nextQuestion() {
    return {
        action: UserActions.NEXT_QUESTION,
    };
}

function endQuestions() {
    return {
        action: UserActions.END_QUESTIONS,
    };
}

function showResults() {
    return {
        action: UserActions.SHOW_RESULTS,
    };
}

function leaveRoom() {
    return {
        action: UserActions.LEAVE_ROOM,
    };
}

function updateState(action, setState, socket) {
    switch (action.action) {
        case UserActions.BACK_TO_START:
            setState({
                mode: AppModes.START_PAGE,
            });
            break;
        case UserActions.JOIN_ROOM:
            break; // TODO
        case UserActions.LOGIN:
            socket.send(JSON.stringify({
                Login: {
                    username: action.username,
                    password: action.password,
                }
            }));
            setState({
                mode: AppModes.LOGGING_IN,
            });
            break;
        case UserActions.BACK_TO_CREATE_ROOM:
            setState({
                mode: AppModes.CREATE_ROOM,
            });
            break;
        case UserActions.SELECT_ANSWER:
            break; // TODO
        case UserActions.CREATE_ROOM:
            socket.send(JSON.stringify({
                CreateRoom: {
                    room_name: action.roomName,
                    password: action.password,
                }
            }));
            setState({
                mode: AppModes.CREATING_ROOM,
                roomName: action.roomName,
            });
            break;
        case UserActions.QUESTION_SETTINGS:
            setState({
                roomMasterMode: RoomMasterModes.SETTINGS,
            });
            break;
        case UserActions.START_QUESTIONS:
            setState({
                roomMasterMode: RoomMasterModes.RUNNING,
                startUUID: action.uuid,
                initialQuestionLength: action.single ? 1 : 0,
            });

            socket.send(JSON.stringify({
                StartQuestions: {
                    mode: action.uuid !== "" ? "uuid" : "plain",
                    start_uuid: action.uuid,
                    shuffle: action.shuffle,
                    ignore_outdated: !action.outdated,
                }
            }));
            break;
        case UserActions.NEXT_QUESTION:
            this.state.socket.send(JSON.stringify("NextQuestion"));
            break;
        case UserActions.SHOW_RESULTS:
            this.state.socket.send(JSON.stringify("ShowResults"));
            break;
        case UserActions.END_QUESTIONS:
            socket.send(JSON.stringify("EndQuestions"));
            break;
        case UserActions.BACK_TO_IDLE:
            setState({
                roomMasterMode: RoomMasterModes.IDLE,
            });
            break;
        case UserActions.LEAVE_ROOM:
            socket.send(JSON.stringify("LeaveRoom"));
            setState(state => {
                return {
                    mode: state.loggedIn ? AppModes.CREATE_ROOM : AppModes.START_PAGE,
                    roomName: "",
                    roomState: 0,
                    selectedAnswer: -1,
                }
            });
            break;
        default:
            setState({
                mode: AppModes.FATAL_ERROR,
                errorMessage: "Unbekannte Aktion angefragt",
            })
    }
}


export {
    UserActions,
    backToStart,
    backToCreateRoom,
    joinRoom,
    login,
    selectAnswer,
    createRoom,
    backToIdle,
    leaveRoom,
    questionSettings,
    startQuestions,
    nextQuestion,
    endQuestions,
    showResults,
    updateState
};
