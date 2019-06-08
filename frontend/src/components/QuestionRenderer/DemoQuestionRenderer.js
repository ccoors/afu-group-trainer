import React from 'react';
import {generateDummyQuestion} from "../../util/util";
import CompactQuestionRenderer from "./CompactQuestionRenderer";
import QuestionRenderer from "./QuestionRenderer";
import QuestionRORenderer from "./QuestionRORenderer";

class DemoQuestionRenderer extends React.Component {
    render() {
        const question = generateDummyQuestion();

        return (
            <div>
                <CompactQuestionRenderer question={question} onDelete={() => {
                }}/>
                <QuestionRenderer question={question} selectedAnswer={2} selectAnswer={() => {
                }}/>
                <QuestionRORenderer question={question} correctAnswer={2} selectedAnswer={0}/>
            </div>
        );
    }
}

export default DemoQuestionRenderer;
