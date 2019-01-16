import React from "react";
import {Header, Icon} from "semantic-ui-react";
import Chart from "react-apexcharts";
import QuestionRORenderer from "./question_renderer_ro";

class Results extends React.Component {
    render() {
        if (!this.props.roomResults) {
            return null;
        }
        let total = this.props.roomResults.selected.reduce((l, r) => l + r);
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
            xaxis: {
                categories: ["A", "B", "C", "D"]
            }
        };
        let series = [
            {
                name: "Antworten",
                data: this.props.roomResults.selected
            }
        ];
        return <div>
            <Header as="h1" content="Ergebnisse"/>
            {this.props.selectedAnswer !== -1 && this.props.selectedAnswer !== this.props.roomResults.correctAnswer && this.props.roomResults.correctAnswer !== -1 &&
            <Header as="h2" color="red">
                <Icon name="close"/>
                <Header.Content>Leider falsch beantwortet</Header.Content>
            </Header>}
            {this.props.selectedAnswer !== -1 && this.props.selectedAnswer === this.props.roomResults.correctAnswer && this.props.roomResults.correctAnswer !== -1 &&
            <Header as="h2" color="green">
                <Icon name="check"/>
                <Header.Content>Korrekt</Header.Content>
            </Header>}
            <p>Von {this.props.roomResults.totalUsers} Benutzern haben {total} die Frage beantwortet.</p>
            {this.props.roomResults.correctAnswer !== -1 &&
            <p className={"correctAnswer"}>Korrekte
                Antwort: {["A", "B", "C", "D"][this.props.roomResults.correctAnswer]}</p>}
            <Chart
                options={options}
                series={series}
                type="bar"
            />
            {this.props.roomQuestion && this.props.roomQuestion.uuid &&
            <div><p>Die Frage lautete:</p>
                <QuestionRORenderer question={this.props.roomQuestion}
                                    correctAnswer={this.props.roomResults.correctAnswer}/></div>}
        </div>;
    }
}

export default Results;
