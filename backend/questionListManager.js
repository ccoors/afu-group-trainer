const fs = require("fs");
const uuidv4 = require("uuid/v4");

let QuestionListManager = function (database, callback, userCallback) {
    this.callback = callback;
    this.userCallback = userCallback;
    this.database = database;
    try {
        this.questionLists = JSON.parse(fs.readFileSync(this.database).toString());
    } catch (e) {
        this.questionLists = [];
    }
    this.sort();
};

QuestionListManager.prototype.sort = function() {
    this.questionLists.sort((a, b) => {
        const n1 = a.name.toUpperCase();
        const n2 = b.name.toUpperCase();
        if (n1 < n2) {
            return -1;
        }
        if (n1 > n2) {
            return 1;
        }
        if (a.id < b.id) {
            return -1;
        }
        if (a.id > b.id) {
            return 1;
        }
        return 0;
    });
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
        uuid: id,
        name: name,
        user: user,
        is_public: is_public,
        questions: [],
    };
    this.questionLists.push(newList);
    this.sort();

    this.userCallback(user);

    if (is_public) {
        this.callback();
    }
    return id;
};

QuestionListManager.prototype.updateList = function (id, name, is_public, questions) {
    let existing = this.questionLists.find(l => l.uuid === id);
    if (existing) {
        const was_public = existing.is_public;
        existing.name = name;
        existing.is_public = is_public;
        existing.questions = questions;

        this.sort();

        if (was_public !== is_public) {
            this.callback();
        }

        this.userCallback(existing.user);
    } else {
        throw "List not found";
    }
};

QuestionListManager.prototype.deleteList = function (id, user) {
    let existing = this.questionLists.find(l => l.uuid === id && l.user === user);
    if (existing) {
        const index = this.questionLists.indexOf(existing);
        this.questionLists.splice(index, 1);

        this.sort();

        if (existing.is_public) {
            this.callback();
        }

        this.userCallback(existing.user);
        return true;
    } else {
        return false;
    }
};

QuestionListManager.prototype.getPublicLists = function () {
    return this.questionLists.filter(l => l.is_public);
};

QuestionListManager.prototype.getListsForUser = function (user) {
    return this.questionLists.filter(l => l.user === user);
};

module.exports = {
    QuestionListManager,
};
