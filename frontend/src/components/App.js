import PropTypes from 'prop-types';
import React, { Component } from 'react';
import MathJax from 'react-mathjax';
import { Responsive } from 'semantic-ui-react';
import AppFooter from './Footer';

import AppHeader from './Header';
import MainContent from './MainContent';

class App extends Component {
  render() {
    return (
      <MathJax.Provider script={this.props.mathJaxProvider}>
        <AppHeader appState={this.props.appState} />
        <div style={{ height: '4em' }} />
        <Responsive {...Responsive.onlyComputer}>
          <div style={{ height: '2em' }} />
        </Responsive>

        <MainContent {...this.props} />
        <div className='fillContent' />
        <AppFooter version="0.5.4" footerLink={this.props.footerLink} />
      </MathJax.Provider>
    );
  }
}

App.propTypes = {
  socketUrl: PropTypes.string.isRequired,
  mathJaxProvider: PropTypes.string.isRequired,
  footerLink: PropTypes.node.isRequired,
  release: PropTypes.bool.isRequired,
  color: PropTypes.string.isRequired,
};

export default App;
