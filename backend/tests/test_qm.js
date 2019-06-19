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
        qm.readQuestions("assets/Fragenkatalog.json");
        expect(qm.countAllQuestions() > 100).to.equal(true);
    });

    it("Unique UUIDs", function () {
        let qm = new question_manager.QuestionManager();
        qm.readQuestions("assets/Fragenkatalog.json");
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
        qm.readQuestions("assets/Fragenkatalog.json");

        expect(qm.getQuestionList("FooBar")).to.equal(null);
        // expect(qm.getQuestionList("a240057a-83a1-5aef-ad10-2ad669385706").length).to.equal(1);
        // expect(qm.getQuestionList("1dc54820-1387-5203-825f-96540614bbb9").length).to.equal(11);
        // expect(qm.getQuestionList("").length).to.equal(863);
    });

    it("Get solution URL", function() {
        const qm = new question_manager.QuestionManager();
        qm.readQuestions("assets/Fragenkatalog.json");

        const questions = qm.getQuestionList("f05caa00-97b7-571c-9ec2-40b3c3f701ef")
        expect(questions.length).to.equal(1);

        const question = questions[0];
        const url = qm.getSolutionLink(question.uuid);
        expect(url).to.equal('lichtblicke/E/TA202.pdf');
    });
});
