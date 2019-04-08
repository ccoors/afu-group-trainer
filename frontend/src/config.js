import React from "react";
import {List} from "semantic-ui-react";

let config = {};

config.mathJaxProvider = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML";
config.webSocketPort = 63605;
config.webSocketUrl = "";
config.footerLink = <List.Item href='about:blank' target="_blank"
                               rel="noopener noreferrer">Impressum &amp; Datenschutz</List.Item>;
config.release = false;

export default config;
