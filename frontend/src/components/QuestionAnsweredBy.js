import React from 'react';

function QuestionAnsweredBy(props) {
    if (props.appState.usersOnline > 1) {
        return <p>Bisher wurde die Frage von {props.appState.usersAnswered} beantwortet.</p>;
    } else {
        return null;
    }
}

export default QuestionAnsweredBy;
