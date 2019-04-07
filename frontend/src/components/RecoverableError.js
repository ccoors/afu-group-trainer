import React from "react";

import {Button, Card, Container, Header,} from "semantic-ui-react"

class RecoverableError extends React.Component {
    render() {
        return (
            <Container text>
                <Card fluid>
                    <Card.Content>
                        <Header as="h1">Fehler</Header>
                        <p>{this.props.message}</p>
                        <Button color={this.props.color} fluid size="large" onClick={() => {
                            this.props.onOk();
                        }}>
                            <Button.Content visible>Zurück</Button.Content>
                        </Button>
                    </Card.Content>
                </Card>
            </Container>

        );
    }
}

export default RecoverableError;
