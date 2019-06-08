const fs = require("fs");

let QuestionManager = function () {
    this.root_node = {
        uuid: "",
        id: "",
        name: "",
        shortname: "",
        prefix: "",
        children: [],
        questions: [],
    };
};

QuestionManager.prototype.readQuestions = function (path) {
    let data = fs.readFileSync(path);
    this.root_node.children = this.root_node.children.concat(JSON.parse(data).children);
};

QuestionManager.prototype.countAllQuestions = function () {
    let ret = 0;
    this.root_node.children.forEach(function (c) {
        ret += this.countQuestions(c);
    }.bind(this));
    return ret;
};

QuestionManager.prototype.countQuestions = function (category) {
    let ret = category.questions.length;
    category.children.forEach(function (c) {
        ret += this.countQuestions(c);
    }.bind(this));
    return ret;
};

QuestionManager.prototype.getDatabase = function () {
    return this.root_node;
};

QuestionManager.prototype.getQuestions = function (category) {
    let questions = category.questions;
    category.children.forEach(function (child) {
        let newQuestions = this.getQuestions(child);
        questions = questions.concat(newQuestions);
    }.bind(this));
    return questions;
};

QuestionManager.prototype.findByUUID = function (node, uuid) {
    if (!node) {
        node = this.root_node;
    }

    if (node.uuid === uuid) {
        return node;
    } else {
        let question = node.questions.find(q => q.uuid === uuid);
        if (question) {
            return question;
        }

        for (let i = 0; i < node.children.length; i++) {
            let res = this.findByUUID(node.children[i], uuid);
            if (res) {
                return res;
            }
        }

        return null;
    }
};

QuestionManager.prototype.getQuestionList = function (uuid) {
    let root = this.findByUUID(this.root_node, uuid);

    if (!root) {
        return null;
    }

    if (root.question) {
        return [root];
    } else {
        return this.getQuestions(root, uuid);
    }
};

exports.QuestionManager = QuestionManager;
