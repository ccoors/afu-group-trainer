import {AppModes} from "../components/Controller";

const UserActions = Object.freeze({
    BACK_TO_START: 1,
    JOIN_ROOM: 2,
    LOGIN: 3,
    BACK_TO_CREATE_ROOM: 4,

    SELECT_ANSWER: 10,

    CREATE_ROOM: 20,
    START_QUESTIONS: 21,
    CLOSE_ROOM: 30,
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
        default:
            setState({
                mode: AppModes.FATAL_ERROR,
                errorMessage: "Unbekannte Aktion angefragt",
            })
    }
}


export {UserActions, backToStart, backToCreateRoom, joinRoom, login, selectAnswer, createRoom, updateState};
