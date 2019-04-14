var chai = require("chai");
var expect = chai.expect;
var question_manager = require("../questionManager");

function getUUIDs(category) {
    let uuids = [category.uuid];
    category.questions.forEach(function (q) {
        uuids.push(q.uuid);
    });

    category.children.forEach(function (child) {
        let new_uuids = getUUIDs(child);
        uuids = uuids.concat(new_uuids);
    }.bind(this));
    return uuids;
}

describe("QuestionManager test", function () {
    it("Empty database", function () {
        let qm = new question_manager.QuestionManager();
        expect(qm.countAllQuestions()).to.equal(0);
        expect(qm.getDatabase().children.length).to.equal(0);
    });

    it("Load questions", function () {
        let qm = new question_manager.QuestionManager();
        qm.readQuestions("assets/TechnikE.json");
        let questionCount = qm.countAllQuestions();
        expect(questionCount).to.not.equal(2);
        expect(qm.getDatabase().length).to.not.equal(0);
        qm.readQuestions("assets/BetriebstechnikVorschriften.json");
        expect(qm.countAllQuestions() > questionCount).to.equal(true);
    });

    it("Unique UUIDs", function () {
        let qm = new question_manager.QuestionManager();
        qm.readQuestions("assets/TechnikE.json");
        expect(qm.countAllQuestions()).to.equal(377);
        qm.readQuestions("assets/BetriebstechnikVorschriften.json");
        expect(qm.countAllQuestions()).to.equal(863);
        let database = qm.getDatabase();
        let all_uuids = getUUIDs(database);
        let found_uuids = [];
        all_uuids.forEach(function (q) {
            expect(found_uuids).to.not.contain(q);
            found_uuids.push(q);
        });
    });

    it("Find question lists", function () {
        let qm = new question_manager.QuestionManager();
        qm.readQuestions("assets/TechnikE.json");
        qm.readQuestions("assets/BetriebstechnikVorschriften.json");

        expect(qm.getQuestionList("FooBar")).to.equal(null);
        // expect(qm.getQuestionList("a240057a-83a1-5aef-ad10-2ad669385706").length).to.equal(1);
        // expect(qm.getQuestionList("1dc54820-1387-5203-825f-96540614bbb9").length).to.equal(11);
        expect(qm.getQuestionList("").length).to.equal(863);
    });
});
