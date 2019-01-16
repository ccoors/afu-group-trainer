import React from "react";
import ReactDOM from "react-dom";
import "semantic-ui-css/semantic.css";
import "./index.css";
import App from "./App";

const mathJaxProvider = "https://www.ccoors.de/components/MathJax/MathJax.js?config=TeX-MML-AM_CHTML";
const webSocketPort = 63605;
const release = true;

let protocol = window.location.protocol.startsWith("https") ? "wss://" : "ws://";

if (release) {
    window.onbeforeunload = function () {
        return "Achtung! Sie sind im Begriff, die Seite zu verlassen. In diesem Fall werden Sie aus dem Raum entfernt. Fortfahren?";
    };
}

ReactDOM.render(<App socketUrl={protocol + window.location.hostname + ":" + webSocketPort + "/"}
                     mathJaxProvider={mathJaxProvider} color="green"/>, document.getElementById("root"));
