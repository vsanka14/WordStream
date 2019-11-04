import React from 'react';
import * as d3 from 'd3';
import {draw} from './draw';

export default class Graph extends React.Component {
    constructor(props) {
        super(props);
        this.svg = null;
        this.axisGroup = null;
        this.xGridlinesGroup = null;
        this.mainGroup = null;
        this.legendGroup = null;
    }

    componentDidMount() {
        this.svg = d3.select(document.querySelector('#mainsvg'));
        this.axisGroup = this.svg.append('g').attr("id", "axisGroup");
        this.xGridlinesGroup = this.svg.append('g').attr("id", "xGridlinesGroup");
        this.mainGroup = this.svg.append('g').attr("id", "main");
        this.legendGroup = this.svg.append('g').attr("id", "legend");
    }

    componentDidUpdate() {
        if(!this.loadGraphData){
            draw(
                this.svg, 
                this.props.graphData, 
                this.props.fileName, 
                this.props.categories,
                this.axisGroup,
                this.xGridlinesGroup,
                this.mainGroup, 
                this.legendGroup
            );
        }
    }

    render() {
        return(
            <svg id="mainsvg" width="1400" height="600"> </svg>
        )
    }
}