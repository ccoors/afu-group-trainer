import React from 'react';

import {
    Segment,
    List,
} from 'semantic-ui-react'

class AppFooter extends React.Component {
    render() {
        return (
            <footer>
                <Segment inverted vertical borderless style={{paddingLeft: "0.6cm", paddingRight: "0.6cm"}}>
                    <List floated="right" horizontal size="small">
                        <List.Item>{this.props.version}</List.Item>
                        <List.Item href='https://www.ccoors.de/impressum-datenschutz/' target="_blank"
                                   rel="noopener noreferrer">Impressum &amp; Datenschutz</List.Item>
                        <List.Item href={"https://gitea.ccoors.de/ccoors/afu-group-trainer"} target={"_blank"}
                                   rel={"noopener noreferrer"}>Source</List.Item>
                    </List>
                </Segment>
            </footer>
        );
    }
}

export default AppFooter;
