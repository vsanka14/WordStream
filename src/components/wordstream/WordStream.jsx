import React from 'react';
import WS from './boxes/WS.jsx';

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
                <WS 
                    globalHeight={1200} 
                    globalWidth={800} 
                    minFontSize={15}
                    maxFontSize={35}
                />
            </div> 
        )
    }
}