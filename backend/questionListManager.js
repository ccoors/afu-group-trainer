const fs = require("fs");
const uuidv4 = require("uuid/v4");

let QuestionListManager = function (database, callback) {
    this.callback = callback;
    this.database = database;
    try {
        this.questionLists = JSON.parse(fs.readFileSync(this.database).toString());
    } catch (e) {
        this.questionLists = [];
    }
};

QuestionListManager.prototype.sync = function () {
    try {
        fs.writeFileSync(this.database, JSON.stringify(this.questionLists))
    } catch (e) {
        // TODO: Handle this better.
        console.log("Writing question list failed - data will be lost when server exits!");
    }
};

QuestionListManager.prototype.createList = function (name, user, is_public) {
    name = name.trim();
    if (name === "") {
        throw "Invalid list name";
    }
    const id = uuidv4();

    const newList = {
        id: id,
        name: name,
        user: user,
        is_public: is_public,
        questions: [],
    };
    this.questionLists.push(newList);

    if (is_public) {
        this.callback();
    }
    return id;
};

QuestionListManager.prototype.updateList = function (id, name, is_public, questions) {
    let existing = this.questionLists.find(l => l.id === id);
    if (existing) {
        const was_public = existing.is_public;
        existing.name = name;
        existing.is_public = is_public;
        existing.questions = questions;

        if (was_public !== is_public) {
            this.callback();
        }
    } else {
        throw "List not found";
    }
};

QuestionListManager.prototype.getPublicLists = function () {
    return this.questionLists.filter(l => l.is_public);
};

module.exports = {
    QuestionListManager,
};
