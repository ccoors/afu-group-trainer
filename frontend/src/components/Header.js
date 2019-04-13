import React from 'react';
import PropTypes from 'prop-types';

import {Dropdown, Menu} from 'semantic-ui-react';

class AppHeader extends React.Component {
    render() {
        return (
            <Menu fixed="top" inverted borderless>
                <Menu.Item header>
                    AGT
                </Menu.Item>
                <Dropdown item text='Formelsammlungen'>
                    <Dropdown.Menu>
                        <Dropdown.Item text='Technik Klasse E'
                                       icon='file'
                                       as='a'
                                       href='formelsammlung/Formelsammlung_E.pdf'
                                       target='_blank'/>
                        <Dropdown.Item text='Technik Klasse A'
                                       icon='file'
                                       as='a'
                                       href='formelsammlung/Formelsammlung_A.pdf'
                                       target='_blank'/>
                    </Dropdown.Menu>
                </Dropdown>
                {this.props.appState.roomName !== "" &&
                <Menu.Item>
                    In Raum „{this.props.appState.roomName}“
                </Menu.Item>}
            </Menu>
        );
    }
}

AppHeader.propTypes = {
    appState: PropTypes.object.isRequired,
};

export default AppHeader;
