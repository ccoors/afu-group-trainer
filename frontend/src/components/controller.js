import React from 'react';

import App from './App';

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
                console.log("Received: " + e.data);
            }
            app.handleSocketMessage(e.data);
        };

        this.state = {
            mode: AppModes.CONNECTING,
        }
    }

    handleSocketMessage(msg) {

    }

    render() {
        return <App appState={this.state} mathJaxProvider={this.props.mathJaxProvider}
                    footerLink={this.props.footerLink} release={this.props.release} color={this.props.color}/>;
    }
}

export default Controller;
