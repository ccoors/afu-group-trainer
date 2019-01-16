var chai = require("chai");
var expect = chai.expect;
var room_manager = require("../roomManager");

describe("RoomManager test", function () {
    it("Empty database", function () {
        let rm = new room_manager.RoomManager(function () {
        });
        expect(rm.getRoomList().length).to.equal(0);
    });

    it("Simple room", function () {
        let rm = new room_manager.RoomManager(function () {
        });
        let user = {
            foo: "bar",
        };
        let room = rm.addRoom("Room1", user, "");
        expect(room.name).to.equal("Room1");
        expect(room.members[0]).to.equal(user);
        expect(rm.getRoomList().length).to.equal(1);
        expect(rm.getRoomByUser(user)).to.equal(room);
        expect(rm.getRoomByName("Room1")).to.equal(room);
        expect(rm.getRoomByUUID(room.uuid)).to.equal(room);

        rm.removeUser(user);
        expect(room.name).to.equal("Room1");
        expect(room.members[0]).to.equal(user);
        expect(rm.getRoomList().length).to.equal(0);
        expect(rm.getRoomByUser(user)).to.equal(undefined);
        expect(rm.getRoomByName("Room1")).to.equal(undefined);
        expect(rm.getRoomByUUID(room.uuid)).to.equal(undefined);
    });

    it("Complex", function () {
        let rm = new room_manager.RoomManager(function () {
        }, function () {
        });
        let user1 = {
            foo: "bar",
        };
        let user2 = {
            blubb: "foo",
        };

        let room1 = rm.addRoom("Room1", user1, "");
        let room2 = rm.addRoom("Room2", user2, "");
        expect(rm.getRoomList().length).to.equal(2);

        rm.addUser(room1, user2, "");
        expect(rm.getRoomList().length).to.equal(1);
        expect(rm.getRoomByUser(user1)).to.equal(rm.getRoomByUser(user2));

        rm.removeUser(user1);

        expect(rm.getRoomList().length).to.equal(0);
    });

    it("Callback", function () {
        let callback = 0, removeCallback = 0, roomCallback = 0, lastRoom = null;
        let rm = new room_manager.RoomManager(function () {
            callback++;
        }, function () {
            removeCallback++;
        }, function (room) {
            lastRoom = room;
            roomCallback++;
        });
        expect(callback).to.equal(0);
        expect(removeCallback).to.equal(0);

        let user1 = {
            foo: "bar",
        };
        let user2 = {
            blubb: "foo",
        };
        let questions = [
            {
                uuid: "uuid1",
                id: "id1",
                question: "Frage1",
                outdated: false,
                answers: [
                    "A1",
                    "A2",
                    "A3",
                    "A4",
                ]
            },
            {
                uuid: "uuid2",
                id: "id2",
                question: "Frage2",
                outdated: false,
                answers: [
                    "A21",
                    "A22",
                    "A23",
                    "A24",
                ]
            },
        ];

        let room = rm.addRoom("Room1", user1, "");
        expect(callback).to.equal(1);
        expect(room.state).to.equal(room_manager.ROOM_STATE.IDLE);
        expect(room.correctAnswer).to.equal(-1);
        expect(room.initialQueueLength).to.equal(0);
        rm.startQuestions(room, questions);
        expect(room.initialQueueLength).to.equal(2);
        expect(roomCallback).to.equal(1);
        expect(lastRoom).to.equal(room);
        lastRoom = null;
        expect(room.queue.length).to.equal(1);
        expect(room.currentQuestion.uuid).to.equal(questions[0].uuid);
        expect(room.correctAnswer).to.not.equal(-1);
        rm.addUser(room, user2, "");
        expect(callback).to.equal(2);
        expect(removeCallback).to.equal(0);
        expect(roomCallback).to.equal(1);
        expect(room.initialQueueLength).to.equal(2);
        rm.nextQuestion(room);
        expect(room.initialQueueLength).to.equal(2);
        expect(roomCallback).to.equal(2);
        expect(lastRoom).to.equal(room);
        lastRoom = null;
        rm.removeUser(user1);
        expect(removeCallback).to.equal(1);
        expect(callback).to.equal(3);
        expect(rm.getRoomList().length).to.equal(0);
        expect(roomCallback).to.equal(2);
        expect(room.queue.length).to.equal(0);
        expect(room.currentQuestion.uuid).to.equal(questions[1].uuid);

        rm.nextQuestion(room);
        expect(room.initialQueueLength).to.equal(0);
        expect(room.state).to.equal(room_manager.ROOM_STATE.IDLE);
        expect(room.correctAnswer).to.equal(-1);
    });

    it("Plain questions", function () {
        let c = 0;
        let rm = new room_manager.RoomManager(function () {}, function () {}, function () { c++; });
        let room = rm.addRoom("Room1", {}, "");
        rm.startQuestions(room, null);
        expect(room.state).to.equal(room_manager.ROOM_STATE.QUESTION);
        expect(c).to.equal(1);
        rm.nextQuestion(room);
        expect(room.state).to.equal(room_manager.ROOM_STATE.QUESTION);
        expect(c).to.equal(2);
    });
});
