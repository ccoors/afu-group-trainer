import PropTypes from 'prop-types';
import React from 'react';

import { List } from 'semantic-ui-react';

class AppFooter extends React.Component {
  render() {
    return (
      <footer>
        <List id="footerList" horizontal size="small">
          <List.Item>{this.props.version}</List.Item>
          {this.props.footerLink}
          <List.Item href={'https://agt.dl5lq.de/doc'} target={'_blank'}
                     rel={'noopener noreferrer'}>Dokumentation</List.Item>
          <List.Item href={'https://github.com/ccoors/afu-group-trainer'} target={'_blank'}
                     rel={'noopener noreferrer'}>Source</List.Item>
        </List>
      </footer>
    );
  }
}

AppFooter.propTypes = {
  version: PropTypes.string.isRequired,
  footerLink: PropTypes.node.isRequired,
};

export default AppFooter;
