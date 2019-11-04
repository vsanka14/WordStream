import React from 'react';
import ControlPanel from './control-panel/ControlPanel.jsx';
import Graph from './graph/Graph.jsx';
import './WordStream.css';

export default class WordStream extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            graphData: null,
            fileName: null,
            categories: null,
            loadWordstreamData: true
        }
        this.setWordstreamData = this.setWordstreamData.bind(this);
    }

    setWordstreamData(resultData, fileName, categories) {
        this.setState({
            graphData: resultData,
            fileName: fileName,
            categories, categories
        }, ()=>{
            this.setState({
                loadGraphData: false
            })
        });
    }
    render() {
        const {graphData, fileName, categories, loadGraphData} = this.state;
        return(
            <div className="row">
                <div className="col-3 controlPanelDiv">
                    <ControlPanel setWordstreamData={this.setWordstreamData}/>
                </div>
                <div className="col-9 graphDiv"> 
                    <Graph graphData = {graphData} fileName = {fileName} categories = {categories} loadGraphData={loadGraphData}/>
                </div>
            </div> 
        )
    }
}