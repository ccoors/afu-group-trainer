import React from 'react';
import PropTypes from 'prop-types';

import {Header, Icon} from "semantic-ui-react";
import Chart from "react-apexcharts";
import QuestionRORenderer from "./QuestionRORenderer";

class Results extends React.Component {
    render() {
        if (!this.props.appState.roomState || !this.props.appState.roomState.results) {
            return null;
        }
        const results = this.props.appState.roomState.results;
        const answeredUsers = results.selected.reduce((l, r) => l + r);

        let chartColors = [];
        for (let i = 0; i < 4; i++) {
            chartColors.push(results.correctAnswer !== -1 ? '#DB2828' : '#2185D0');
        }
        if (results.correctAnswer !== -1) {
            chartColors[results.correctAnswer] = '#21BA45';
        }

        let options = {
            chart: {
                id: "basic-bar",
                toolbar: {
                    show: false,
                    tools: {
                        download: false,
                        selection: false,
                        zoom: false,
                        zoomin: false,
                        zoomout: false,
                        pan: false,
                        reset: false
                    },
                },
            },
            plotOptions: {
                bar: {
                    distributed: true,
                }
            },
            xaxis: {
                categories: ["A", "B", "C", "D"]
            },
            colors: chartColors,
        };
        let series = [
            {
                name: "Antworten",
                data: results.selected
            }
        ];

        let totalUsers = results.totalUsers;
        if (totalUsers < answeredUsers) {
            totalUsers = answeredUsers;
        }

        return <div>
            <Header as="h1" content="Ergebnisse"/>
            {this.props.selectedAnswer !== -1 && this.props.selectedAnswer !== results.correctAnswer && results.correctAnswer !== -1 &&
            <Header as="h2" color="red">
                <Icon name="close"/>
                <Header.Content>Leider falsch beantwortet</Header.Content>
            </Header>}
            {this.props.selectedAnswer !== -1 && this.props.selectedAnswer === results.correctAnswer && results.correctAnswer !== -1 &&
            <Header as="h2" color="green">
                <Icon name="check"/>
                <Header.Content>Korrekt</Header.Content>
            </Header>}
            <p>Von {totalUsers} Benutzern haben {answeredUsers} die Frage beantwortet.</p>
            {results.correctAnswer !== -1 &&
            <p className={"correctAnswer"}>Korrekte
                Antwort: {["A", "B", "C", "D"][results.correctAnswer]}</p>}
            <Chart
                options={options}
                series={series}
                type="bar"
            />
            {this.props.question && this.props.question.uuid &&
            <div><p>Die Frage lautete:</p>
                <QuestionRORenderer question={this.props.question}
                                    selectedAnswer={this.props.selectedAnswer}
                                    correctAnswer={results.correctAnswer}/></div>}
        </div>;
    }
}

Results.propTypes = {
    appState: PropTypes.object.isRequired,
    selectedAnswer: PropTypes.number.isRequired,
    question: PropTypes.object,
};

export default Results;
