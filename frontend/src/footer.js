import React from 'react';

import {List} from 'semantic-ui-react'

class AppFooter extends React.Component {
    render() {
        return (
            <footer>
                <div style={{paddingLeft: "0.2cm", paddingRight: "0.2cm"}}>
                    <List floated="right" horizontal size="small">
                        <List.Item>{this.props.version}</List.Item>
                        {this.props.footerLink}
                        <List.Item href={"https://gitea.ccoors.de/ccoors/afu-group-trainer"} target={"_blank"}
                                   rel={"noopener noreferrer"}>Source</List.Item>
                    </List>
                </div>
            </footer>
        );
    }
}

export default AppFooter;
