import React from 'react';
import PropTypes from 'prop-types';

import {List} from 'semantic-ui-react'

class AppFooter extends React.Component {
    render() {
        return (
            <footer>
                <div id="footerContainer">
                    <List id="footerList" floated="right" horizontal size="small">
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

AppFooter.propTypes = {
    version: PropTypes.string.isRequired,
    footerLink: PropTypes.node.isRequired,
};

export default AppFooter;
