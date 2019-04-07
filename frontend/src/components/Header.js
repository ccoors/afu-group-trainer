import React from 'react';

import {Menu,} from 'semantic-ui-react'

class AppHeader extends React.Component {
    render() {
        return (
            <Menu fixed="top" inverted borderless>
                <Menu.Item header>
                    AGT
                </Menu.Item>
                <Menu.Item href={"formelsammlung/Formelsammlung_E.pdf"} target={"_blank"} color={"black"} active>
                    Formelsammlung Klasse E
                </Menu.Item>
                {/*<Menu.Item href={"formelsammlung/Formelsammlung_A.pdf"} target={"_blank"} color={"black"} active>*/}
                    {/*Formelsammlung Klasse A*/}
                {/*</Menu.Item>*/}
                {this.props.appState.roomName !== "" &&
                <Menu.Item>
                    In Raum „{this.props.roomName}“
                </Menu.Item>}
            </Menu>
        );
    }
}

export default AppHeader;
