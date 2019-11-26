import React from 'react';
import data from './mockdata.json';
import wordStream from './wordstream';
import * as d3 from 'd3';

export default class WS extends React.Component{
    constructor(props) {
        super(props);
        this.margins = {left: 20, top: 20, right: 10, bottom: 30};
        this.axisPadding = 10;
        this.color = d3.scaleOrdinal(d3.schemeCategory10);
        this.boxes = null;
        this.svg = d3.select("#boxes").append('svg');
        this.wordstreamSvg = null;
        this.axisGroup = null;
        this.xGridlinesGroup = null;
        this.ws = null;
        this.draw = this.draw.bind(this);
        this.boxWidth = 1200/data.length;
        this.drawWords = this.drawWords.bind(this);
        this.drawAxis = this.drawAxis.bind(this);
        this.makeBoxes = this.makeBoxes.bind(this);
        this.frequencyScale = null;
        this.streamHeightScale = d3.scaleLinear().domain([400, 800]).range([0, 400]);
        this.area = d3.area()
        .curve(d3.curveCardinal)
            .x((d, i)=>{return ((i)*this.boxWidth);})
            .y0((d, i)=>{return this.frequencyScale(d[0]);})
            .y1((d, i)=>{return this.frequencyScale(d[1]); });
    }

    makeBoxes() {
        let self = this;
         this.boxes.topics.forEach(topic=>{
            var topicGroup = this.wordstreamSvg.append('g');
            topicGroup.selectAll('g').data(this.boxes.innerBoxes[topic]).enter()
            .append('g')
            .append('rect')
            .attr('transform', function(d, i){
                // debugger;
                return 'translate('+((i)*self.boxWidth)+', '+((d.y))+')';
            })
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', self.boxWidth)
            .attr('height',  function(d, i){return (d.height);})
            .attr('fill', (d, i)=>{
                return 'none';
            })
            .attr('stroke', 'black')
            .attr('stroke-size', 10)
            .attr('opacity', 1)
        });
    }
    

    draw() {
        let self = this;
        this.ws = wordStream(data);
        this.ws.buildScales();
        this.frequencyScale = this.ws.frequencyScale();
        this.boxes = this.ws.boxes();
        var pathSelection = this.wordstreamSvg.selectAll('.curve').data(this.boxes.layers);
        pathSelection
        .enter()
        .append('path')
        .attr('class', 'curve')
        .attr('d', this.area)
        .attr('fill-opacity', 0)
        .attr('stroke-width', 1)
        .attr('stroke', 'black')
        .attr('topic', (d,i)=>this.boxes.topics[i])
        .style('fill', (d,i)=>this.color(i));

        this.drawWords();
        this.drawAxis();
        this.makeBoxes();
    }

    drawAxis() {
        let dates = [];
        data.forEach((row, index) => {
            dates.push(row.date);
        });

        let xAxisScale = d3.scaleBand().domain(dates).rangeRound([0, 1180])
        var xAxis = d3.axisBottom(xAxisScale);

        this.axisGroup.attr('transform', 'translate(' + (this.margins.left) + ',' + (600 + this.margins.top ) + ')').attr('class', 'x-axis');
        let axisNodes = this.axisGroup.call(xAxis);

        axisNodes.selectAll('.tick text')
        .attr('font-family', 'serif')
        .attr('font-size', 15);

        // var xGridlineScale = d3.scale.ordinal().domain(d3.range(0, dates.length + 1)).rangeBands([0, width + width / boxes.data.length]);
        // var xGridlinesAxis = d3.axisBottom(xAxisScale);

        // this.xGridlinesGroup.attr('transform', 'translate(' + (this.margins.left - (1180 / this.boxes.data.length) / 2) + ',' + (1200 + this.margins.top + this.axisPadding + this.margins.bottom) + ')');
        // var gridlineNodes = this.xGridlinesGroup.call(xGridlinesAxis
        //     .tickSize(-1100 - this.axisPadding - this.margins.bottom, 0, 0)
        //     // .tickFormat('')
        //     );
        // styleGridlineNodes(gridlineNodes);
    }

    drawWords() {
        var wordStreamG = this.wordstreamSvg.append('g').attr("id", "wordStreamG");
        let self = this;
        let prevColor;
        var allWords = [];
        d3.map(this.boxes.data, (row)=>{
            this.boxes.topics.forEach(topic => {
                allWords = allWords.concat(row.words[topic]);
            });
        });
        var texts = this.wordstreamSvg.selectAll('.word').data(allWords, d => d.id);

        texts.exit().remove();

        var textEnter = texts.enter().append('g')
            .attr('transform', function (d, i) {
                return 'translate(' + (d.x) + ', ' + d.y + ')rotate(' + d.rotate + ')';
            })
            .attr("class", "word")
            .append('text')

        textEnter
            .text(function (d) {
                return d.text;
            })
            .attr('id', d=>d.id)
            .attr('class', 'textData')
            .attr('font-family', 'Arial')
            .attr('font-size', d=>d.fontSize)
            .attr('fill', (d)=>this.color(this.boxes.topics.indexOf(d.topic)))
            .attr('fill-opacity', 1)
            .attr('text-anchor', 'middle')
            .attr('topic', d=>d.topic)
            .attr('visibility', d=>d.placed?'visible':'hidden');

        texts.transition().duration(800)
            .attr('transform', function (d) {
                return 'translate(' + d.x + ', ' + d.y + ')rotate(' + d.rotate + ')';
            })
            .select("text")
            .attr('font-size', function (d) {
                return d.fontSize;
            })
            .attr('visibility', function (d) {
                return d.placed ? "visible" : "hidden";
            });

            this.wordstreamSvg.selectAll('.textData').on('mouseenter', function () {
                console.log('mouse enter.')
                var thisText = d3.select(this);
                thisText.style('cursor', 'pointer');
                prevColor = thisText.attr('fill');
                var text = thisText.text();
                var topic = thisText.attr('topic');
                var allTexts = self.wordstreamSvg.selectAll('.textData').filter(t => {
                    return t && t.text === text && t.topic === topic;
                });
                allTexts.attr('stroke', prevColor).attr('stroke-width', 1);
            });
            this.wordstreamSvg.selectAll('.textData').on('mouseout', function () {
                var thisText = d3.select(this);
                thisText.style('cursor', 'default');
                var text = thisText.text();
                var topic = thisText.attr('topic');
                var allTexts = self.wordstreamSvg.selectAll('.textData').filter(t => {
                    return t && !t.cloned && t.text === text && t.topic === topic;
                });
                allTexts.attr('stroke', 'none').attr('stroke-width', 0);
            });
            this.wordstreamSvg.selectAll('.textData').on('click', function () {
                var thisText = d3.select(this);
                var text = thisText.text();
                var topic = thisText.attr('topic');
                var allTexts = self.wordstreamSvg.selectAll('.textData').filter(t => {
                    return t && t.text === text && t.topic === topic;
                });
                //Select the data for the stream layers
                var streamLayer = d3.select("path[topic='" + topic + "']")._groups[0][0].__data__;
                var points = [];
                streamLayer.forEach((elm, i) => {
                    points.push([elm[1], (elm[1]+1), i*self.boxWidth]);
                });
                // points.unshift(points[0]);
                for(const i in allTexts._groups[0]){
                    let t = allTexts._groups[0][i];
                    var data = t.__data__;
                    var fontSize = data.fontSize;
                    var thePoint = points[data.timeStep + 1];
                    thePoint[1] = (thePoint[0]-self.streamHeightScale(data.streamHeight));
                    var clonedNode = t.cloneNode(true);
                    d3.select(clonedNode)
                    .attr('visibility', 'visible')
                    .attr('stroke', 'none')
                    .attr('stroke-size', 0);

                    var clonedParentNode = t.parentNode.cloneNode(false);
                    clonedParentNode.appendChild(clonedNode);
    
                    t.parentNode.parentNode.appendChild(clonedParentNode);
                    d3.select(clonedParentNode)
                    .attr('cloned', true)
                    .attr('topic', topic)
                    .transition()
                    .duration(300)
                    .attr('transform', function (d, i) {
                        return 'translate(' + (thePoint[2]) + ',' + (self.frequencyScale(thePoint[1])-5) + ')';
                    });
                    wordStreamG.append('path')
                    .datum(points)
                    .attr('d', self.area)
                    .style('fill', prevColor)
                    .attr('fill-opacity', prevColor)
                    .attr('stroke', prevColor)
                    .attr('stroke-width', 0.3)
                    .attr('topic', topic)
                    .attr('wordStream', true);
                    var allOtherTexts = self.wordstreamSvg.selectAll('.textData').filter(t => {
                        return t && !t.cloned && t.topic === topic;
                    });
                    allOtherTexts.attr('visibility', 'hidden');
                }
            });
            self.boxes.topics.forEach(topic => {
                d3.select("path[topic='" + topic + "']").on('click', function () {
                    self.wordstreamSvg.selectAll('.textData').filter(t => {
                        return t && !t.cloned && t.placed && t.topic === topic;
                    })
                    .attr('visibility', 'visible');
                    // .attr({
                    //     visibility: 'visible'
                    // });
                    //Remove the cloned element
                    document.querySelectorAll("g[cloned='true'][topic='" + topic + "']").forEach(node => {
                        node.parentNode.removeChild(node);
                    });
                    //Remove the added path for it
                    document.querySelectorAll("path[wordStream='true'][topic='" + topic + "']").forEach(node => {
                        node.parentNode.removeChild(node);
                    });
                });
    
            });
    }

    componentDidMount() {
        this.svg = d3.select("#boxes").append('svg');
        this.svg
            .attr('id', 'mainSvg')
            .attr('width', 1200)
            .attr('height', 800)
            .attr('transform', 'translate(50, 0)');
        this.wordstreamSvg = this.svg.append('g');
        this.wordstreamSvg.attr('id', 'wordstreamSvg');
        this.axisGroup = this.svg.append('g').attr("id", "axisGroup");
        this.xGridlinesGroup = this.svg.append('g').attr("id", "xGridlinesGroup");
        this.draw();
    }
    render() {
        return(
            <div id="boxes"> </div>
        )
    }
}