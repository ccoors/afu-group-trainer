import React from "react";
import ReactDOM from "react-dom";
import "semantic-ui-css/semantic.css";
import "./index.css";
import {List} from "semantic-ui-react";
import App from "./App";

// Config
const mathJaxProvider = "https://www.ccoors.de/components/MathJax/MathJax.js?config=TeX-MML-AM_CHTML";
const webSocketPort = 63605;
let webSocketUrl = "";
const footerLink = <List.Item href='https://www.ccoors.de/impressum-datenschutz/' target="_blank"
                              rel="noopener noreferrer">Impressum &amp; Datenschutz</List.Item>;
const release = false;
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

ReactDOM.render(<App socketUrl={webSocketUrl} mathJaxProvider={mathJaxProvider} footerLink={footerLink}
                     color="green"/>, document.getElementById("root"));
