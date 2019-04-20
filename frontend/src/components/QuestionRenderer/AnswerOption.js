import React from 'react';
import PropTypes from 'prop-types';

import {Grid, Header, Segment} from "semantic-ui-react";

import {stringToJSX} from "../../util/util";

class AnswerOption extends React.Component {
    render() {
        const {letter, text, letterStyle, attributes} = this.props;
        return <Segment {...attributes}>
            <Grid columns={2}>
                <Grid.Row>
                    <Grid.Column verticalAlign='middle' width={text === "" ? 16 : 1}>
                        <Header as='h3' textAlign='center' style={letterStyle}>
                            {letter}
                        </Header>
                    </Grid.Column>
                    {text !== "" && <Grid.Column width={15}>
                        {stringToJSX(text)}
                    </Grid.Column>}
                </Grid.Row>
            </Grid>
        </Segment>
    }
}

AnswerOption.propTypes = {
    letter: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    letterStyle: PropTypes.object,
    attributes: PropTypes.object,
};

AnswerOption.defaultProps = {
    attributes: {},
    letterStyle: {},
};

export default AnswerOption;