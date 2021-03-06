const fs = require("fs");
const https = require("https");

const WebSocket = require("ws");

const qm = require("./questionManager");
const rm = require("./roomManager");
const qlm = require("./questionListManager");
const util = require("./util");

const Influx = require('influx');

function noop() {
}

function heartbeat() {
    this.isAlive = true;
}

let ServerManager = function (config) {
    this.users = config.users;
    this.influx_config = Object.assign({}, {
        enabled: false,
        field_prefix: "agt_",
        interval: 60
    }, config.influx);
    this.influx = null;

    if (!Array.isArray(this.users) || this.users.length === 0) {
        throw "No users configured!";
    }

    if (config.tlsConfig.useTLS) {
        let server = new https.createServer({
            cert: fs.readFileSync(config.tlsConfig.cert),
            key: fs.readFileSync(config.tlsConfig.key)
        });
        this.wss = new WebSocket.Server({
            clientTracking: true,
            server: server
        });
        server.listen(config.websocketPort);
    } else {
        this.wss = new WebSocket.Server({
            port: config.websocketPort,
            clientTracking: true,
        });
    }

    this.wss.on("connection", function connection(ws) {
        ws.isAlive = true;
        ws.loggedIn = false;
        ws.on("pong", heartbeat);

        ws.on("message", function (data) {
            this.onClientMessage(ws, data, config.debug);
        }.bind(this));

        ws.on("close", function connection() {
            this.roomManager.removeUser(ws);
        }.bind(this));

        this.callback();
    }.bind(this));

    if (config.pingTest) {
        this.pingInterval = setInterval(function ping() {
            this.wss.clients.forEach(function (ws) {
                if (ws.isAlive === false) return ws.terminate();

                ws.isAlive = false;
                ws.ping(noop);

                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        KeepAlive: {
                            next: 2 * config.pingTest,
                        }
                    }));
                }
            }.bind(this));
        }.bind(this), config.pingTest);
    }

    this.questionManager = new qm.QuestionManager();
    this.roomManager = new rm.RoomManager(this.callback.bind(this),
        this.removeUserFromRoom.bind(this),
        this.sendRoomStatus.bind(this));
    this.questionListManager = new qlm.QuestionListManager('assets/dynamic/questionList.json',
        this.sendPublicListUpdate.bind(this),
        this.sendUserListUpdate.bind(this));
    this.questionListManager.sync();

    config.questions.forEach(file => this.loadQuestions(file));

    if (this.influx_config.enabled) {
      this.influx = new Influx.InfluxDB(Object.assign({}, this.influx_config.config, {
        schema: [
          {
            measurement: this.influx_config.field_prefix + 'stats',
            fields: {
              room_count: Influx.FieldType.INTEGER,
              user_count: Influx.FieldType.INTEGER,
            },
            tags: []
          }
        ]
      }));

      this.influx.getDatabaseNames()
        .then(names => {
          if (!names.includes(this.influx_config.config.database)) {
            return this.influx.createDatabase(this.influx_config.config.database);
          }
        })
        .catch(error => console.log({ error }));

      setInterval(() => {
        this.influx.writePoints([
          {
            measurement: this.influx_config.field_prefix + 'stats',
            fields: {
              room_count: this.roomManager.getRoomCount(),
              user_count: this.wss.clients.size,
            },
          }
        ], {
          database: this.influx_config.config.database,
          precision: 's',
        })
          .catch(error => {
            console.error(`Error saving data to InfluxDB! ${error.stack}`)
          });
      }, this.influx_config.interval)
    }
};

ServerManager.prototype.broadcast = function (data, requireLogin) {
    this.wss.clients.forEach(function each(client) {
        if (requireLogin && !client.loggedIn) return;
        if (client.readyState === WebSocket.OPEN) client.send(data);
    });
};

ServerManager.prototype.callback = function () {
    let rooms = this.roomManager.getRoomList();

    this.broadcast(JSON.stringify({
        RoomList: rooms
    }));
};

ServerManager.prototype.removeUserFromRoom = function (client) {
    if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify("LeaveRoom"));
    }
};

ServerManager.prototype.sendPublicListUpdate = function (client) {
    const public_lists = this.questionListManager.getPublicLists();
    const payload = JSON.stringify({
        PublicQuestionLists: public_lists
    });

    if (client && client.readyState === WebSocket.OPEN) {
        client.send(payload);
    } else {
        this.broadcast(payload, true);
    }
};

ServerManager.prototype.sendUserListUpdate = function (user) {
    const user_lists = this.questionListManager.getListsForUser(user);

    const payload = JSON.stringify({
        UserQuestionLists: user_lists,
    });

    this.wss.clients.forEach(function each(client) {
        if (client.loggedIn && client.loggedInAs === user) {
            if (client.readyState === WebSocket.OPEN) client.send(payload);
        }
    });
};

ServerManager.prototype.sendRoomStatus = function (room) {
    let msg = "";
    let remainingQuestions = Array.isArray(room.queue) ? room.queue.length : 0;
    let users_selected = room.members.filter(m => m.selectedAnswer !== -1).length;
    let total_users = room.members.length - 1;

    switch (room.state) {
        case rm.ROOM_STATE.IDLE:
            msg = JSON.stringify({
                RoomState: {
                    state: room.state,
                    remainingQuestions: remainingQuestions,
                    initialQuestionLength: room.initialQueueLength,
                }
            });
            break;
        case rm.ROOM_STATE.QUESTION:
            msg = JSON.stringify({
                RoomState: {
                    state: room.state,
                    remainingQuestions: remainingQuestions,
                    initialQuestionLength: room.initialQueueLength,
                    question: room.currentQuestion,
                    previousQuestions: room.previousQuestions,
                    countdown: (room.countdownInterval ? room.countdown : null),
                    userState: {
                        selected: users_selected,
                        total: total_users,
                    }
                }
            });
            break;
        case rm.ROOM_STATE.RESULTS:
            let solutionURL = null;
            if (room.currentQuestion) {
                solutionURL = this.questionManager.getSolutionLink(room.currentQuestion.uuid);
            }
            msg = JSON.stringify({
                RoomState: {
                    state: room.state,
                    remainingQuestions: remainingQuestions,
                    initialQuestionLength: room.initialQueueLength,
                    question: room.currentQuestion,
                    previousQuestions: room.previousQuestions,
                    solutionURL: solutionURL,
                    results: {
                        totalUsers: room.members.length - 1,
                        correctAnswer: room.correctAnswer,
                        selected: room.results,
                    },
                }
            });
            break;
    }

    room.members.forEach(function (user) {
        if (user.readyState === WebSocket.OPEN) user.send(msg);
    });
};

ServerManager.prototype.sendDatabase = function (client) {
    if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
            QuestionDatabase: this.questionManager.getDatabase()
        }));
    }
};

ServerManager.prototype.loadQuestions = function (file) {
    this.questionManager.readQuestions(file);
};

ServerManager.prototype.getTotalQuestions = function () {
    return this.questionManager.countAllQuestions();
};

ServerManager.prototype.onClientMessage = function (client, data, debug) {
    try {
        if (debug) {
            console.log("DEBUG: Received " + data);
        }
        let json = JSON.parse(data);
        if (json.Login) {
            let username = json.Login.username;
            let password = json.Login.password;

            let found_user = this.users.find(u => u.username === username && u.password === password);
            if (found_user) {
                client.loggedIn = true;
                client.loggedInAs = username;
                client.selectedAnswer = -1;
                this.sendLoginResult(client, true);
                this.sendDatabase(client);
                this.sendPublicListUpdate(client);
                this.sendUserListUpdate(username);
            } else {
                this.sendLoginResult(client, false);
            }
        } else if (json.CreateRoom) {
            let roomName = json.CreateRoom.room_name;
            let password = json.CreateRoom.password;

            if (!client.loggedIn) {
                this.sendCreateRoomResult(client, false, "");
            } else {
                try {
                    let room = this.roomManager.addRoom(roomName, client, password);
                    this.sendCreateRoomResult(client, true, room.uuid);
                } catch (e) {
                    this.sendCreateRoomResult(client, false, "");
                }
            }
        } else if (json.JoinRoom) {
            let roomUUID = json.JoinRoom.room_uuid;
            let password = json.JoinRoom.password;

            let joinRoom = this.roomManager.getRoomByUUID(roomUUID);
            let currentRoom = this.roomManager.getRoomByUser(client);
            if (currentRoom && currentRoom !== joinRoom) {
                this.roomManager.removeUser(client);
            }

            if (joinRoom && joinRoom !== currentRoom) {
                try {
                    this.roomManager.addUser(joinRoom, client, password);
                    this.sendJoinRoomResult(client, true);
                    this.sendRoomStatus(joinRoom);
                } catch (e) {
                    this.sendJoinRoomResult(client, false);
                }
            } else {
                this.sendJoinRoomResult(client, joinRoom === currentRoom);
            }
        } else if (json === "LeaveRoom" || json.LeaveRoom) {
            this.roomManager.removeUser(client);
        } else if (json.StartQuestions) {
            let mode = json.StartQuestions.mode;
            let start_uuid = json.StartQuestions.start_uuid;
            let shuffle = json.StartQuestions.shuffle;
            let ignore_outdated = json.StartQuestions.ignore_outdated;

            let adminRoom = this.roomManager.getRoomByUserAdmin(client);
            if (client.loggedIn && adminRoom) {
                let questions = null;
                if (mode === "uuid") {
                    questions = this.questionManager.getQuestionList(start_uuid);
                    if (questions === null) {
                        questions = this.questionListManager.findList(start_uuid);
                        if (questions) {
                            questions = questions.map(q => this.questionManager.findByUUID(null, q));
                        }
                    }
                    if (ignore_outdated && questions.length > 1) {
                        questions = questions.filter(q => !q.outdated);
                    }
                    if (shuffle) {
                        util.shuffle(questions);
                    }
                }
                this.roomManager.startQuestions(adminRoom, questions);
            }
        } else if (json === "ShowResults" || json.ShowResults) {
            let adminRoom = this.roomManager.getRoomByUserAdmin(client);
            if (client.loggedIn && adminRoom) {
                this.roomManager.showResults(adminRoom);
            }
        } else if (json === "NextQuestion" || json.NextQuestion) {
            let adminRoom = this.roomManager.getRoomByUserAdmin(client);
            if (client.loggedIn && adminRoom) {
                this.roomManager.nextQuestion(adminRoom);
            }
        } else if (json === "EndQuestions" || json.EndQuestions) {
            let adminRoom = this.roomManager.getRoomByUserAdmin(client);
            if (client.loggedIn && adminRoom) {
                this.roomManager.endQuestions(adminRoom);
            }
        } else if (json.AnswerQuestion) {
            let answer = parseInt(json.AnswerQuestion.id);
            if (answer < 0 || answer > 3) {
                answer = -1;
            }
            client.selectedAnswer = answer;
            let room = this.roomManager.getRoomByUser(client);
            if (room) {
                this.sendRoomStatus(room);
            }
        } else if (json.StartCountdown) {
            let adminRoom = this.roomManager.getRoomByUserAdmin(client);
            if (client.loggedIn && adminRoom) {
                this.roomManager.startCountdown(adminRoom, json.StartCountdown.time);
            }
        } else if (json === "StopCountdown" || json.StopCountdown) {
            let adminRoom = this.roomManager.getRoomByUserAdmin(client);
            if (client.loggedIn && adminRoom) {
                this.roomManager.resetCountdown(adminRoom);
                this.sendRoomStatus(adminRoom);
            }
        } else if (json.CreateQuestionList) {
            if (!client.loggedIn) {
                this.sendCreateQuestionListResult(client, false, "");
                return;
            }
            const list_name = json.CreateQuestionList.list_name;
            try {
                const id = this.questionListManager.createList(list_name, client.loggedInAs, false);
                this.sendCreateQuestionListResult(client, true, id);
            } catch (e) {
                this.sendCreateQuestionListResult(client, false, "");
                this.sendUserListUpdate(client.loggedInAs); // The client forgot his list, so resend it
            }
        } else if (json.UpdateQuestionList) {
            if (!client.loggedIn) {
                // TODO: Handle better
                throw "Operation not allowed.";
            }
            const {list_uuid, list_name, is_public, questions} = json.UpdateQuestionList;
            questions.forEach(q => {
                let found = this.questionManager.findByUUID(null, q);
                if (!found) {
                    throw "List contains invalid question.";
                }
            });
            this.questionListManager.updateList(list_uuid, list_name, is_public, questions);
            this.questionListManager.sync();
        } else if (json.DeleteQuestionList) {
            if (!client.loggedIn) {
                // TODO: Handle better
                throw "Operation not allowed.";
            }
            const result = this.questionListManager.deleteList(json.DeleteQuestionList.list_uuid, client.loggedInAs);
            this.questionListManager.sync();
            if (!result) {
                // TODO: Handle better
                this.sendUserListUpdate(client.loggedInAs);
                throw "List not found.";
            }
        } else {
            this.sendError(client, "Command not found");
        }
    } catch (e) {
        let msg = e.toString();
        this.sendError(client, msg);
    }
};

ServerManager.prototype.sendLoginResult = function (ws, success) {
    if (ws.readyState !== WebSocket.OPEN) {
        return;
    }
    ws.send(JSON.stringify({
        LoginResult: success,
    }));
};

ServerManager.prototype.sendJoinRoomResult = function (ws, success) {
    if (ws.readyState !== WebSocket.OPEN) {
        return;
    }
    ws.send(JSON.stringify({
        JoinRoomResult: success,
    }));
};

ServerManager.prototype.sendCreateQuestionListResult = function (ws, success, uuid) {
    if (ws.readyState !== WebSocket.OPEN) {
        return;
    }
    ws.send(JSON.stringify({
        CreateQuestionListResult: {
            success: success,
            uuid: uuid,
        }
    }));
};

ServerManager.prototype.sendCreateRoomResult = function (ws, success, uuid) {
    if (ws.readyState !== WebSocket.OPEN) {
        return;
    }
    ws.send(JSON.stringify({
        CreateRoomResult: {
            success: success,
            uuid: uuid,
        }
    }));
};

ServerManager.prototype.sendError = function (client, message) {
    if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
            Error: {
                message: message
            }
        }));
    }
};

exports.ServerManager = ServerManager;
