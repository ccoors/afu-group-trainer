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

QuestionManager.prototype.getParent = function (root, uuid) {
    if (root.questions) {
        const question = root.questions.find(c => c.uuid === uuid);
        if (question) {
            return root;
        }
    }

    if (root.children) {
        const child = root.children.find(c => c.uuid === uuid);
        if (child) {
            return root;
        }

        const results = root.children.map(c => this.getParent(c, uuid)).filter(c => c);
        if (results.length > 0) {
            return results[0];
        }
    }

    return null;
};

QuestionManager.prototype.getSolutionLink = function (question_uuid) {
    const question = this.findByUUID(null, question_uuid);
    if (!question) return null;
    let parent = this.getParent(this.getDatabase(), question_uuid);
    while (parent && !parent.hasOwnProperty('solution_url')) {
        parent = this.getParent(this.getDatabase(), parent.uuid);
    }

    if (parent && parent.hasOwnProperty('solution_url')) {
        return parent.solution_url.replace("$ID$", question.id);
    }
    return null;
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
