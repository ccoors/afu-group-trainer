import PropTypes from 'prop-types';
import React from 'react';

import { Button, Header, Tab } from 'semantic-ui-react';

import QuestionListRenderer from '../LoggedIn/QuestionListRenderer';
import QuestionTreeCategory from './QuestionTreeCategory';

class QuestionTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchInput: '',
    };
  }

  renderDatabaseNormal() {
    const tabPanes = this.props.appState.questionDatabase.children.map(c => {
      return {
        menuItem: {
          key: c.shortname,
          content: c.shortname
        },
        render: () => {
          return <QuestionTreeCategory category={c} color={this.props.color}
                                       goToSettings={this.props.goToSettings}
                                       quickStartQuestions={this.props.quickStartQuestions} />;
        }
      };
    });

    return <Tab menu={{
      secondary: true,
      pointing: true
    }} activeIndex={this.props.selectedTab}
                onTabChange={this.props.selectTab} panes={tabPanes} />;
  }

  render() {
    const tabPanes = [
      {
        menuItem: {
          key: 'catalog',
          icon: 'book',
          content: 'Fragenkataloge'
        },
        render: () => {
          return <Tab.Pane>
            {this.renderDatabaseNormal()}
          </Tab.Pane>;
        }
      },
      {
        menuItem: {
          key: 'lists',
          icon: 'list',
          content: 'Fragenlisten'
        },
        render: () => <Tab.Pane>
          <Header as="h2" content="Meine Fragenlisten" />
          <QuestionListRenderer questionList={this.props.appState.myQuestionLists}
                                questionDatabase={this.props.appState.questionDatabase}
                                actionHandler={this.props.appState.actionHandler}
                                publicLists={false} allowEdit={true}
                                startQuestions={this.props.quickStartQuestions} />

          <Header as="h2" content="Öffentliche Fragelisten" />
          <QuestionListRenderer questionList={this.props.appState.publicQuestionLists}
                                questionDatabase={this.props.appState.questionDatabase}
                                startQuestions={this.props.quickStartQuestions} />
        </Tab.Pane>
      },
      {
        menuItem: {
          key: 'special',
          icon: 'star',
          content: 'Sonderfunktionen'
        },
        render: () => <Tab.Pane>
          <Button color={this.props.color} size="small"
                  onClick={() => this.props.quickStartQuestions('')}>
            <Button.Content visible>Leere ABCD-Fragen stellen</Button.Content>
          </Button>
        </Tab.Pane>
      }
    ];

    return <div>
      <Tab panes={tabPanes} />
    </div>;
  }
}

QuestionTree.propTypes = {
  appState: PropTypes.object.isRequired,
  quickStartQuestions: PropTypes.func.isRequired,
  goToSettings: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired,
  selectedTab: PropTypes.number.isRequired,
  selectTab: PropTypes.func.isRequired
};

export default QuestionTree;
