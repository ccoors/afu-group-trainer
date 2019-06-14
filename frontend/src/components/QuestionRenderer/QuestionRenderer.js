import * as Mousetrap from 'mousetrap';
import PropTypes from 'prop-types';
import React from 'react';

import {Form, Header, Segment} from 'semantic-ui-react';
import {questionTitle, stringToJSX} from '../../util/util';
import AnswerOption from './AnswerOption';
import OutdatedQuestionLabel from './OutdatedQuestionLabel';

class QuestionRenderer extends React.Component {
    componentDidMount() {
        Mousetrap.bind(['0', 'x'], () => this.selectAnswer(-1));
        [...Array(4).keys()].forEach(i => {
            Mousetrap.bind([String(i + 1), 'abcd'[i]], () => this.selectAnswer(i));
        });
    }

    componentWillUnmount() {
        Mousetrap.unbind(['0', 'x']);
        [...Array(4).keys()].forEach(i => {
            Mousetrap.unbind([String(i + 1), 'abcd'[i]]);
        });
    }

    selectAnswer(value) {
        this.props.selectAnswer(value);
    }

    // 4: No answer
    renderAnswer(nr) {
        const answerString = nr < 4 ? this.props.question.answers[nr] : '';
        const selectAnswer = nr < 4 ? nr : -1;
        const letter = ['A', 'B', 'C', 'D', 'Frage nicht beantworten'][nr];
        let attributes = {
            className: 'pointer',
            onClick: () => this.selectAnswer(selectAnswer),
        };
        let letterStyle = {};

        const selected = selectAnswer === this.props.selectedAnswer;
        if (selected) {
            attributes.color = 'blue';
            attributes.inverted = true;
            letterStyle.color = 'white';
        }

        return <AnswerOption key={'answer' + nr} letter={letter} text={answerString} attributes={attributes}
                             letterStyle={letterStyle}/>;
    }

    render() {
        const questionList = [...Array(5).keys()].map(n => this.renderAnswer(n));

        return <div>
            {this.props.question.id &&
            <Header as={'h1'} content={questionTitle(this.props.question)}/>
            }
            {this.props.question.outdated &&
            <OutdatedQuestionLabel/>
            }

            {this.props.question.question !== '' &&
            <p>{stringToJSX(this.props.question.question)}</p>}

            <Form>
                <Segment.Group>
                    {questionList}
                </Segment.Group>
            </Form>
        </div>;
    }
}

QuestionRenderer.propTypes = {
    question: PropTypes.object.isRequired,
    selectedAnswer: PropTypes.number.isRequired,
    selectAnswer: PropTypes.func.isRequired,
};

export default QuestionRenderer;
