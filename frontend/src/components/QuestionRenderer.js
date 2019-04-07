import React from "react";
import {Form, Header, Label, Radio, Segment} from "semantic-ui-react";
import {stringToJSX} from "../util/util";

class QuestionRenderer extends React.Component {
    selectAnswer(e, value) {
        this.props.selectAnswer(value.value);
    }

    render() {
        let c = -1;
        let answerCopy = JSON.parse(JSON.stringify(this.props.question.answers));
        answerCopy.push("");

        let questionList = answerCopy.map(a => {
            c++;
            let answerLabel = ["A", "B", "C", "D", "Frage nicht beantworten"][c];
            if (c === 4) {
                c = -1;
            }
            let content = <div><Radio
                label={answerLabel}
                name="radioGroup"
                value={c}
                checked={this.props.selectedAnswer === c}
                onChange={this.selectAnswer.bind(this)}
            />{a !== "" &&
            <p>{stringToJSX(a)}</p>}</div>;

            let cCopy = parseInt(c);
            if (c === this.props.selectedAnswer) {
                return <Segment className={"pointer"} color={"blue"} inverted key={"a" + c}
                                onClick={() => this.selectAnswer(null, {value: cCopy})}>
                    {content}
                </Segment>;
            } else {
                return <Segment className={"pointer"} key={"a" + c}
                                onClick={() => this.selectAnswer(null, {value: cCopy})}>
                    {content}
                </Segment>;
            }
        });

        return <div>
            {this.props.question.id &&
            <Header as={"h1"} content={this.props.question.id}/>
            }
            {this.props.question.outdated &&
            <Label as="a" color="red" ribbon="right">
                Nicht mehr relevante Frage
            </Label>
            }

            {this.props.question.question !== "" &&
            <p>{stringToJSX(this.props.question.question)}</p>}

            <Form>
                <Segment.Group>
                    {questionList}
                </Segment.Group>
            </Form>
        </div>;
    }
}

export default QuestionRenderer;
