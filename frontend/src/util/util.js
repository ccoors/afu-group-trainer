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

// For dev purposes
function generateDummyQuestion() {
    return {
        id: "TX123",
        question: "Lorem Ipsum dolor <code>SIT AMET</code>, $U=R\\cdot{}I$",
        outdated: true,
        answers: ["$\\sum_{x=5}^{10} x = 5 + 6 + 7 + 8 + 9 + 10 = 45$", "<code>CQ CQ CQ DE DL123 PSE K</code>", "FooBar", "Lorem Ipsum dolor sit amet"],
    };
}

function findQuestion(root, question) {
    const ret = root.questions.find(q => q.uuid === question);
    if (ret) {
        return ret;
    }

    const findings = root.children.map(c => findQuestion(c, question));
    const child = findings.find(c => c !== null);

    if (child) {
        return child;
    } else {
        return null;
    }
}

function questionMatches(question, search) {
    return question.id.toLowerCase().includes(search)
        || question.question.toLowerCase().includes(search)
        || question.answers.some(a => a.toLowerCase().includes(search));
}

function findQuestions(root, search) {
    let ret = root.questions.filter(q => questionMatches(q, search));

    const children = root.children.map(c => findQuestions(c, search));
    children.forEach(l => {
        ret = ret.concat(l);
    });

    return ret;
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

export {generateEmptyQuestion, generateDummyQuestion, findQuestion, findQuestions, stringToJSX, ltrim};
