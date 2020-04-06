import PropTypes from 'prop-types';
import React from 'react';
import { Container, Tab } from 'semantic-ui-react';
import CreateRoom from './CreateRoom';
import ManageQuestionLists from './ManageQuestionLists';

class LoggedIn extends React.Component {
  render() {
    let tabPanes = [
      {
        menuItem: {
          key: 'createRoom',
          content: 'Raum erstellen',
          icon: 'add'
        },
        render: () => <Tab.Pane>
          <CreateRoom {...this.props} />
        </Tab.Pane>
      },
      {
        menuItem: {
          key: 'manageLists',
          content: 'Fragenlisten verwalten',
          icon: 'list'
        },
        render: () => <Tab.Pane>
          <ManageQuestionLists {...this.props} />
        </Tab.Pane>
      }
    ];


    return <Container>
      <Tab panes={tabPanes} />
    </Container>;
  }
}

LoggedIn.propTypes = {
  appState: PropTypes.object.isRequired,
  color: PropTypes.string.isRequired,
};

export default LoggedIn;
