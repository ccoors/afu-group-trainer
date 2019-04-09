import React from "react";
import ReactDOM from "react-dom";

import "semantic-ui-css/semantic.css";
import "./index.css";

import Controller from "./components/Controller";

import config from "./config";

if (config.release) {
    window.onbeforeunload = function () {
        return "Achtung! Sie sind im Begriff, die Seite zu verlassen. In diesem Fall werden Sie aus dem Raum entfernt. Fortfahren?";
    };
}

if (!config.webSocketUrl) {
    let protocol = window.location.protocol.startsWith("https") ? "wss://" : "ws://";
    config.webSocketUrl = protocol + window.location.hostname + ":" + config.webSocketPort + "/";
}

const rootElement = document.getElementById("root");

ReactDOM.render(<Controller socketUrl={config.webSocketUrl} mathJaxProvider={config.mathJaxProvider}
                            footerLink={config.footerLink} release={config.release} color="blue"/>, rootElement);
