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
        this.drawWords = this.drawWords.bind(this);
        this.drawAxis = this.drawAxis.bind(this);
    }

    draw() {
        this.ws = wordStream(data);
        this.ws.buildScales();
        this.boxes = this.ws.boxes();
        this.drawWords();
        this.drawAxis();
    }

    drawAxis() {
        let dates = [];
        data.forEach(row => {
            dates.push(row.date);
        });
        console.log(dates);
        let xAxisScale = d3.scaleBand().domain(dates).range([0, 800]);
        var xAxis = d3.axisBottom(xAxisScale);
    
        this.axisGroup.attr('transform', 'translate(' + (this.margins.left) + ',' + (900 + this.margins.top + this.axisPadding) + ')');
        this.axisGroup.call(xAxis);

        // let xGridlineScale = d3.scaleBand().domain(d3.range(0, dates.length+1)).range([0, 800 + 800/data.length]);
        // let xGridlinesAxis = d3.axisBottom(xGridlineScale);
    
        // this.xGridlinesGroup.attr('transform', 'translate(' + (this.margins.left - 800 / data.length / 2) + ',' + (1200 + this.margins.top + this.axisPadding + this.margins.bottom) + ')');
        // this.xGridlinesGroup.call(xGridlinesAxis.tickSize(-1200 - this.axisPadding - this.margins.bottom, 0, 0).tickFormat(''));
    }

    drawWords() {
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
    }

    componentDidMount() {
        this.svg = d3.select("#boxes").append('svg');
        this.svg
            .attr('id', 'mainSvg')
            .attr('width', 1200)
            .attr('height', 800)
            .attr('transform', 'translate(50, 0)');
        this.wordstreamSvg = this.svg.append('g').attr("id", "wordstreamSvg");
        this.axisGroup = this.svg.append('g').attr("id", "axisGroup");
        this.xGridlinesGroup = this.svg.append('g').attr("id", "xGridlinesGroup");
        this.draw();
    }

    // componentDidMount() {
    //     let font = 'Arial';
    //     let ws = wordStream(data);
    //     ws.buildScales();
    //     var color = d3.scaleOrdinal(d3.schemeCategory10);
    //     let boxes = ws.boxes();
    //     let frequencyScale = ws.frequencyScale();
    //     var svg = d3.select("#boxes").append('svg');
    //     svg.attr('id', 'mainSvg').attr('width', 1200).attr('height', 800).attr('transform', 'translate(50, 0)');
    //     var wordstreamSvg = svg.append('g').attr("id", "wordstreamSvg");
    //     // var boxWidth = 1200/data.length;
    //     // var area = d3.area()
    //     //     .curve(d3.curveCardinal)
    //     //     .x(function(d, i){return ((i)*boxWidth);})
    //     //     .y0(function(d, i){return frequencyScale(d[0]);})
    //     //     .y1(function(d, i){return frequencyScale(d[1]); });

    //     // var paths = wordstreamSvg.append('g').attr('transform', 'translate(' + 0 + ',' + 0 + ')');
    //     // var pathSelection = paths.selectAll('path').data(boxes.layers);
    //     // pathSelection
    //     // .enter()
    //     // .append('path')
    //     // .attr('d', area)
    //     // .attr('fill-opacity', 0)
    //     // .attr('stroke-size', 0.3)
    //     // .attr('stroke', 'white')
    //     // .style('fill', function () {
    //     //     return 'none';
    //     // }); 
    //     // boxes.topics.forEach(topic=>{
    //     //     var topicGroup = wordstreamSvg.append('g');
    //     //     topicGroup.selectAll('g').data(boxes.innerBoxes[topic]).enter()
    //     //     .append('g')
    //     //     .append('rect')
    //     //     .attr('transform', function(d, i){
    //     //         // debugger;
    //     //         return 'translate('+((i)*boxWidth)+', '+((d.y))+')';
    //     //     })
    //     //     .attr('x', 0)
    //     //     .attr('y', 0)
    //     //     .attr('width', boxWidth)
    //     //     .attr('height',  function(d, i){return (d.height);})
    //     //     .attr('fill', (d, i)=>{
    //     //         return 'none';
    //     //     })
    //     //     .attr('stroke', 'black')
    //     //     .attr('stroke-size', 10)
    //     //     .attr('opacity', 0)
    //     // });

    //     var allWords = [];
    //     d3.map(boxes.data, function (row) {
    //         boxes.topics.forEach(topic => {
    //             allWords = allWords.concat(row.words[topic]);
    //         });
    //     });

    //     var texts = wordstreamSvg.selectAll('.word').data(allWords, d => d.id);

    //     texts.exit().remove();

    //     var textEnter = texts.enter().append('g')
    //         .attr('transform', function (d, i) {
    //             return 'translate(' + (d.x) + ', ' + d.y + ')rotate(' + d.rotate + ')';
    //         })
    //         .attr("class", "word")
    //         .append('text')

    //     textEnter
    //         .text(function (d) {
    //             return d.text;
    //         })
    //         .attr('id', d=>d.id)
    //         .attr('class', 'textData')
    //         .attr('font-family', font)
    //         .attr('font-size', d=>d.fontSize)
    //         .attr('fill', (d)=>color(boxes.topics.indexOf(d.topic)))
    //         .attr('fill-opacity', 1)
    //         .attr('text-anchor', 'middle')
    //         .attr('topic', d=>d.topic)
    //         .attr('visibility', d=>d.placed?'visible':'hidden');

    //     texts.transition().duration(800)
    //         .attr('transform', function (d) {
    //             return 'translate(' + d.x + ', ' + d.y + ')rotate(' + d.rotate + ')';
    //         })
    //         .select("text")
    //         .attr('font-size', function (d) {
    //             return d.fontSize;
    //         })
    //         .attr('visibility', function (d) {
    //             return d.placed ? "visible" : "hidden";
    //         });
    // }
    render() {
        return(
            <div id="boxes"> </div>
        )
    }
}