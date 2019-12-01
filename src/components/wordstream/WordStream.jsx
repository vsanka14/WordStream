import React from 'react';
import ControlPanel from './control-panel/ControlPanel.jsx';
import Graph from './graph/Graph.jsx';
import StackBar from './stack-bar/StackBar.jsx';

import './WordStream.css';

export default class WordStream extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            layersData: null,
            wordsData: null,
            activeGraph: null,
            stackBarData: null
        };
        this.setLayersData = this.setLayersData.bind(this);
        this.setWordsData = this.setWordsData.bind(this);
        this.setActiveGraph = this.setActiveGraph.bind(this);
        this.setStackBarData = this.setStackBarData.bind(this);
        this.screenDimensions = [1200, 1200];
    }

    setStackBarData(stackBarData) {
        this.setState({
            stackBarData: stackBarData
        })
    }

    setLayersData(layersData) {
        this.setState({
            layersData: layersData
        });
    }

    setWordsData(wordsData) {
        this.setState({
            wordsData: wordsData
        })
    }

    setActiveGraph(activeGraph) {
        this.setState({
            activeGraph: activeGraph
        })
    }

    render() {
        return(
            <div className="row">
                <div className="col-12"> 
                    <h1 style={{fontStyle:'italic'}}> WordStream: Interactive Topic Visualization </h1>
                </div>
                <br/>
                <div className="col-3 controlPanelDiv"> 
                    <ControlPanel
                        setLayersData={this.setLayersData}
                        setWordsData={this.setWordsData}
                        screenDimensions={this.screenDimensions}
                        setActiveGraph={this.setActiveGraph}
                    />
                </div>
                <div className="col-9 graphDiv"> 
                    <Graph 
                        layersData={this.state.layersData}
                        wordsData={this.state.wordsData}
                        screenDimensions={this.screenDimensions}
                        activeGraph={this.state.activeGraph}
                        setStackBarData={this.setStackBarData}/>
                </div>
               <div className="col-12"> 
                    <StackBar 
                        activeGraph={this.state.activeGraph}
                        stackBarData={this.state.stackBarData}/>
               </div>
            </div> 
        )
    }
}