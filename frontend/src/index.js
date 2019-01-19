import React from "react";
import ReactDOM from "react-dom";
import "semantic-ui-css/semantic.css";
import "./index.css";
import App from "./App";

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

ReactDOM.render(<App socketUrl={config.webSocketUrl} mathJaxProvider={config.mathJaxProvider}
                     footerLink={config.footerLink} color="green"/>, document.getElementById("root"));
