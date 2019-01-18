import React from "react";
import ReactDOM from "react-dom";
import "semantic-ui-css/semantic.css";
import "./index.css";
import App from "./App";

// Config
const mathJaxProvider = "https://www.ccoors.de/components/MathJax/MathJax.js?config=TeX-MML-AM_CHTML";
const webSocketPort = 63605;
const release = true;
let webSocketUrl = "";
// End of config

if (release) {
    window.onbeforeunload = function () {
        return "Achtung! Sie sind im Begriff, die Seite zu verlassen. In diesem Fall werden Sie aus dem Raum entfernt. Fortfahren?";
    };
}

if (!webSocketUrl) {
    let protocol = window.location.protocol.startsWith("https") ? "wss://" : "ws://";
    webSocketUrl = protocol + window.location.hostname + ":" + webSocketPort + "/";
}

ReactDOM.render(<App socketUrl={webSocketUrl} mathJaxProvider={mathJaxProvider}
                     color="green"/>, document.getElementById("root"));
