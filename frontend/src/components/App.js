import React, {Component} from "react";
import PropTypes from 'prop-types';

import AppHeader from "./Header";
import AppFooter from "./Footer";
import MainContent from "./MainContent";
import MathJax from "react-mathjax";
import {Responsive} from "semantic-ui-react";

class App extends Component {
    render() {
        return (
            <MathJax.Provider script={this.props.mathJaxProvider}>
                <AppHeader appState={this.props.appState}/>
                <div style={{height: "4em"}}/>
                <Responsive {...Responsive.onlyComputer}>
                    <div style={{height: "2em"}}/>
                </Responsive>

                <MainContent {...this.props}/>
                <div style={{height: "5em"}}/>
                <AppFooter version={"0.3.0"} footerLink={this.props.footerLink}/>
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
