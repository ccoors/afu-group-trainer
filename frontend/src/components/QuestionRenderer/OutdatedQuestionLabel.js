import React from 'react';
import {Label} from 'semantic-ui-react';

class OutdatedQuestionLabel extends React.Component {
    render() {
        return <div><Label color="purple" ribbon="right">
            Nicht mehr relevante Frage
        </Label></div>;
    }
}

export default OutdatedQuestionLabel;
