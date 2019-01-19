const WebSocket = require('ws');
const room = "test";

const clients = 100;

for (let i = 0; i < clients; i++) {
    let ws = new WebSocket("ws://localhost:63605/");

    ws.on('message', function incoming(message) {
        try {
            let data = JSON.parse(message);
            console.log(data);
            if (data.RoomList) {
                let joinUUID = data.RoomList.find(r => r.name === room).uuid;
                ws.send(JSON.stringify({
                    JoinRoom: {
                        room_uuid: joinUUID,
                        password: "",
                    }
                }));
            } else if (data.RoomState) {
                if (data.RoomState.state === 1) {
                    ws.send(JSON.stringify({
                        AnswerQuestion: {
                            id: parseInt(Math.random() * 4)
                        }
                    }));
                }
            }
        } catch (e) {
            console.log("Error: " + e.toString());
        }
    });

    ws.on('close', function (data) {
        console.log(data);
    });
}

