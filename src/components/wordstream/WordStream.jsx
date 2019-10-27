import React from 'react';
import ControlPanel from './control-panel/ControlPanel.jsx';
import Graph from './graph/Graph.jsx';
import './WordStream.css';

export default class WordStream extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            graphData: null
        }
        this.setGraphData = this.setGraphData.bind(this);
    }

    setGraphData(resultData) {
        this.setState({
            graphData: resultData
        });
    }

    componentDidUpdate() {
        console.log('graphData: ', this.state);
    }

    render() {
        const {graphData} = this.state;
        return(
            <div className="row">
                <div className="col-3 controlPanelDiv">
                    <ControlPanel setGraphData={this.setGraphData}/>
                </div>
                <div className="col-9 graphDiv"> 
                    <Graph graphData = {graphData}/>
                </div>
            </div> 
        )
    }
}