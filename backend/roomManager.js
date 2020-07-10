const { v4: uuidv4 } = require('uuid');
const util = require("./util");

const ROOM_STATE = Object.freeze({
    IDLE: 0,
    QUESTION: 1,
    RESULTS: 2,
});

let RoomManager = function (callback, removeCallback, roomCallback) {
    this.rooms = [];
    this.callback = callback;
    this.removeCallback = removeCallback;
    this.roomCallback = roomCallback;
};

RoomManager.prototype.getRoomByUUID = function (roomUUID) {
    return this.rooms.find(r => r.uuid === roomUUID);
};

RoomManager.prototype.getRoomByName = function (roomName) {
    return this.rooms.find(r => r.name === roomName);
};

RoomManager.prototype.getRoomByUser = function (user) {
    return this.rooms.find(r => r.members.includes(user));
};

RoomManager.prototype.getRoomByUserAdmin = function (user) {
    return this.rooms.find(r => r.members.includes(user) && r.members[0] === user);
};

RoomManager.prototype.addRoom = function (roomName, user, password) {
    this.removeUser(user);

    roomName = roomName.trim();

    let room = this.getRoomByName(roomName);
    if (roomName === "" || room) {
        throw "Can not create room with this name";
    }

    let newRoom = {
        uuid: uuidv4(),
        name: roomName,
        password: password,
        members: [user],
        state: ROOM_STATE.IDLE,
        queue: [],
        initialQueueLength: 0,
        currentQuestion: null,
        correctAnswer: -1,
        results: [],
        previousQuestions: [],
        countdown: 0,
        countdownInterval: null,
    };

    this.rooms.push(newRoom);
    this.callback();

    return newRoom;
};

RoomManager.prototype.resetCountdown = function(room) {
    if (room.countdownInterval) {
        clearInterval(room.countdownInterval);
        room.countdownInterval = null;
    }
    room.countdown = 0;
};

RoomManager.prototype.startCountdown = function (room, countdown) {
    if (room.state !== ROOM_STATE.QUESTION) {
        return;
    }
    this.resetCountdown(room);

    room.countdown = countdown;
    room.countdownInterval = setInterval(() => {
        room.countdown--;
        this.roomCallback(room);
        if (room.countdown === 0) {
            clearInterval(room.countdownInterval);
            this.showResults(room);
        }
    }, 1000);
    this.roomCallback(room);
};

RoomManager.prototype.startQuestions = function (room, questions) {
    room.queue = JSON.parse(JSON.stringify(questions)); // Ugh. JavaScript.
    if (Array.isArray(room.queue)) {
        room.initialQueueLength = room.queue.length;
    } else {
        room.initialQueueLength = 0;
    }
    room.currentQuestion = null;
    room.correctAnswer = -1;
    room.previousQuestions = [];
    this.nextQuestion(room);
};

RoomManager.prototype.showResults = function (room) {
    this.resetCountdown(room);
    if (room.state !== ROOM_STATE.QUESTION) {
        return;
    }
    room.results = [0, 0, 0, 0];
    room.members.forEach(function (m) {
        if (m.selectedAnswer !== -1) {
            room.results[m.selectedAnswer]++;
        }
    });
    room.state = ROOM_STATE.RESULTS;
    this.roomCallback(room);
};

RoomManager.prototype.nextQuestion = function (room) {
    this.resetCountdown(room);
    room.state = ROOM_STATE.QUESTION;
    room.members.forEach(function (m) {
        m.selectedAnswer = -1;
    });
    if (Array.isArray(room.queue)) {
        if (room.queue.length > 0) {
            if (room.currentQuestion) {
                room.previousQuestions.push(Object.assign({
                    correctAnswer: room.correctAnswer
                }, room.currentQuestion));
            }
            room.currentQuestion = room.queue.shift();
            let correctAnswer = room.currentQuestion.answers[0];
            util.shuffle(room.currentQuestion.answers);
            room.correctAnswer = room.currentQuestion.answers.indexOf(correctAnswer);
        } else {
            this.endQuestions(room);
        }
    }
    this.roomCallback(room);
};

RoomManager.prototype.endQuestions = function (room) {
    this.resetCountdown(room);
    room.state = ROOM_STATE.IDLE;
    room.queue = [];
    room.currentQuestion = null;
    room.correctAnswer = -1;
    room.initialQueueLength = 0;
    this.roomCallback(room);
};

RoomManager.prototype.addUser = function (room, user, password) {
    this.removeUser(user);

    user.selectedAnswer = -1;

    if (room) {
        if (room.password || password) {
            if (room.password !== password) {
                throw "Incorrect password";
            }
        }

        room.members.push(user);
    }

    this.callback();
};

RoomManager.prototype.getRoomList = function () {
    return this.rooms.map(function (r) {
        return {
            uuid: r.uuid,
            name: r.name,
            users: r.members.length,
            password_required: r.password !== "",
        }
    })
};

RoomManager.prototype.getRoomCount = function () {
    return this.rooms.length;
};

RoomManager.prototype.cleanUpRooms = function () {
    while (this.rooms.find(r => r.members.length === 0)) {
        let room = this.rooms.find(r => r.members.length === 0);
        let index = this.rooms.indexOf(room);
        if (index > -1) {
            this.rooms.splice(index, 1);
        } else {
            break;
        }
    }
};

RoomManager.prototype.removeUser = function (user) {
    let room = this.getRoomByUser(user);

    if (room) {
        if (room.members.length >= 1 && room.members[0] === user) {
            let index = this.rooms.indexOf(room);
            if (index > -1) {
                this.rooms.splice(index, 1);
            }
            for (let i = 1; i < room.members.length; i++) {
                this.removeCallback(room.members[i]);
            }
        } else {
            let index = room.members.indexOf(user);
            if (index > -1) {
                room.members.splice(index, 1);
            }
            this.roomCallback(room);
        }

        this.cleanUpRooms();
        this.callback();
    }
};

module.exports = {
    RoomManager,
    ROOM_STATE
};
