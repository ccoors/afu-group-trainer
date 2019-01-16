import MathJax from "react-mathjax";
import React from "react";
import {Image} from "semantic-ui-react";

function generateEmptyQuestion() {
    return {
        uuid: "",
        id: "Frage",
        question: "Bitte die gestellte Frage beantworten.",
        outdated: false,
        answers: ["", "", "", ""],
    };
}

function stringToJSX(string) {
    if (typeof string !== "string") {
        return string;
    }
    let mathElements = string.match(/(?:\$).*?(?:\$)/g);
    let tokens = string.replace(/((?:\$).*?(?:\$)|(?:<img src=.*">))/g, function (i) {
        if (!i.startsWith("<img")) {
            return "$_$";
        } else {
            let imageRegex = /(?:<img src=")(.*)(:?">)/;
            let file = imageRegex.exec(i)[1];
            return "$img/" + file + "$";
        }
    }).split("$");

    let c = 0;
    tokens = tokens.map(t => {
            c++;
            let isString = (typeof t === "string" || t instanceof String);
            if (isString && t === "_" && mathElements.length > 0) {
                let element = mathElements.shift().replace(/\$/gi, "");
                t = <MathJax.Node formula={element} inline key={"n" + c}/>;
            } else if (isString && t.endsWith(".png")) {
                t = <Image src={t} key={"n" + c} centered style={{marginTop: "0.4em"}}/>;
            } else {
                t = <span key={"n" + c} dangerouslySetInnerHTML={{__html: t}}/>;
            }
            return t;
        }
    );

    return <span>{tokens}</span>;
}

function ltrim(str) {
    return str.replace(/^\s+/, "");
}

export {generateEmptyQuestion, stringToJSX, ltrim};
