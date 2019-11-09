import * as d3 from 'd3';
import {wordStream} from './d3.layout.wordstream';

const color = d3.scaleOrdinal(d3.schemeCategory10);
var allW;
var opacScale;
const initWidth = 1400,
    initHeight = 660,
    initMinFont = 15,
    initMaxFont = 35,
    initFlag = "none";// none / fa/ f / a

var initTop = 15;

var globalWidth = initWidth,
    globalHeight = initHeight,
    globalMinFont = initMinFont,
    globalMaxFont = initMaxFont,
    globalFlag = initFlag;

var opacity, layerPath, maxFreq;

export const draw = (svg, data, fileName, categories, axisGroup, xGridlinesGroup, mainGroup, legendGroup) =>{
    //Layout data
    var font = "Arial";
    var interpolation = "cardinal";
    const axisPadding = 10;
    const legendFontSize = 12;
    const legendOffset = 10;
    var legendHeight = categories.length * legendFontSize;

    const margins = {left: 20, top: 20, right: 10, bottom: 30};
    var width = globalWidth - (margins.left + margins.top);
    var height = globalHeight - (+margins.top + margins.bottom + axisPadding + legendHeight);
    var ws = wordStream(fileName)
            .size([width, height])
            .fontScale(d3.scaleLinear())
            .minFontSize(globalMinFont)
            .maxFontSize(globalMaxFont)
            .data(data)
            .flag(globalFlag)
        // .font(font)
        // .interpolate(interpolation)
        // .fontScale(d3.scaleLinear())
    ;
    var boxes = ws.boxes();
    var minSud = ws.minSud();
    var maxSud = ws.maxSud();
    maxFreq = ws.maxFreq();

    //set svg data.
    svg
        .transition()
        .duration(300)
        .attr({
            width: globalWidth,
            height: globalHeight,
        });

    var area = d3.area()
        .curve(d3.curveLinear)
        .x(function (d) {
            return (d.x);
        })
        .y0(function (d) {
            return d.y0;
        })
        .y1(function (d) {
            return (d.y0 + d.y);
        });

    //Display time axes
    var dates = [];
    boxes.data.forEach(row => {
        dates.push(row.date);
    });

    var xAxisScale = d3.scaleBand().domain(dates).range([0, width]);
    var xAxis = d3.axisBottom(xAxisScale);

    axisGroup.attr('transform', 'translate(' + (margins.left) + ',' + (height + margins.top + axisPadding + legendHeight) + ')');
    var axisNodes = axisGroup.call(xAxis);
    styleAxis(axisNodes);

    //Display the vertical gridline
    var xGridlineScale = d3.scaleBand().domain(d3.range(0, dates.length + 1)).range([0, width + width / boxes.data.length]);
    var xGridlinesAxis = d3.axisBottom(xGridlineScale);

    xGridlinesGroup.attr('transform', 'translate(' + (margins.left - width / boxes.data.length / 2) + ',' + (height + margins.top + axisPadding + legendHeight + margins.bottom) + ')');
    var gridlineNodes = xGridlinesGroup.call(xGridlinesAxis.tickSize(-height - axisPadding - legendHeight - margins.bottom, 0, 0).tickFormat(''));
    styleGridlineNodes(gridlineNodes);

    //Main group
    mainGroup.attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');
    var wordStreamG = mainGroup.append('g').attr("id", "wordStreamG");

// =============== Get BOUNDARY and LAYERPATH ===============
    const lineCardinal = d3.line()
        .x(function (d) {
            return d.x;
        })
        .y(function (d) {
            return d.y;
        })
        .curve(d3.curveCardinal);

    var boundary = [];
    for (var i = 0; i < boxes.layers[0].length; i++) {
        var tempPoint = Object.assign({}, boxes.layers[0][i]);
        tempPoint.y = tempPoint.y0;
        boundary.push(tempPoint);
    }

    for (var i = boxes.layers[boxes.layers.length - 1].length - 1; i >= 0; i--) {
        var tempPoint2 = Object.assign({}, boxes.layers[boxes.layers.length - 1][i]);
        tempPoint2.y = tempPoint2.y + tempPoint2.y0;
        boundary.push(tempPoint2);
    }       // Add next (8) elements

    var lenb = boundary.length;

    // Get the string for path
    var combined = lineCardinal(boundary.slice(0, lenb / 2))
        + "L"
        + lineCardinal(boundary.slice(lenb / 2, lenb))
            .substring(1, lineCardinal(boundary.slice(lenb / 2, lenb)).length)
        + "Z";
    // ============= Get LAYER PATH ==============

    layerPath = mainGroup.append("path")
        .attr("d", combined)
        .attr("visibility", "hidden")
        .attr("class", "layerpath")
        .attr({
            'fill-opacity': 1,
            'stroke-opacity': 0,
        });
        // console.log('line139 layerPath: ', combined);
    // draw curves
    var topics = boxes.topics;

    var curve = mainGroup.selectAll('.curve').data(boxes.layers);
    // console.log(curve);
    curve.enter()
        .append('path')
        .attr('d', area)
        .style('fill', function (d, i) {
            return color(i);
        })
        .attr('class', 'curve')
        .attr('fill-opacity', 0)
        .attr('stroke', 'black')
        .attr('stroke-width', 0)
        .attr('topic', (d, i)=>topics[i]);
        // .attr({
        //     "class": "curve",
        //     'fill-opacity': 0,
        //     stroke: 'black',
        //     'stroke-width': 0,
        //     topic: function (d, i) {
        //         return topics[i];
        //     }
        // });

    curve
        .attr('fill-opacity', 0)
        .attr('stroke', 'black')
        .attr('stroke-width', 0)
        .attr('topic', (d, i)=>topics[i])
        .attr("d", area)
        .style('fill', function (d, i) {
            return color(i);
        });
    
    curve.exit().remove();

    var allWords = [];
    d3.map(boxes.data, function (row) {
        boxes.topics.forEach(topic => {
            allWords = allWords.concat(row.words[topic]);
        });
    });

    allW = JSON.parse(JSON.stringify(allWords));

    opacity = d3.scaleLog()
        .domain([minSud, maxSud])
        .range([0.4, 1]);

    var lineScale;
    if (fileName.indexOf("Huffington") >= 0) {
        d3.json("data/linksHuff2012.json", function (error, rawLinks) {
            const threshold = 5;
            const links = rawLinks.filter(d => d.weight > threshold);
            var isRel = document.getElementById("rel").checked;

            links.forEach(d => {
                d.sourceID = d.sourceID.split(".").join("_").split(" ").join("_");
                d.targetID = d.targetID.split(".").join("_").split(" ").join("_");
            });
            let visibleLinks = [];

            // select only links with: word place = true and have same id
            links.forEach(d => {
                let s = allWords.find(w => (w.id === d.sourceID) && (w.placed === true));
                let t = allWords.find(w => (w.id === d.targetID) && (w.placed === true));
                if ((s !== undefined) && (t !== undefined)) {
                    visibleLinks.push({
                        sourceX: s.x,
                        sourceY: s.y,
                        targetX: t.x,
                        targetY: t.y,
                        weight: d.weight,
                        sourceID: d.sourceID,
                        targetID: d.targetID,
                        id: d.sourceID + "_" + d.targetID
                    });
                }
            });

            lineScale = d3.scaleLinear()
                .domain(d3.extent(visibleLinks, d => d.weight))
                .range([0.5, 3]);

            opacScale = d3.scaleLinear()
                .domain(d3.extent(visibleLinks, d => d.weight))
                .range([0.5, 1]);

            var connection = mainGroup.selectAll(".connection").data(visibleLinks, d => d.id);
            connection.exit().remove();

            connection.enter()
                .append("line")
                .attr("class", "connection");

            connection.transition()
                .duration(800)
                .attr("opacity", isRel ? 1 : 0)
                .attr({
                    "x1": d => d.sourceX,
                    "y1": d => d.sourceY,
                    "x2": d => d.targetX,
                    "y2": d => d.targetY,
                    "stroke": "#444444",
                    "stroke-opacity": d => opacScale(d.weight),
                    "stroke-width": d => lineScale(d.weight)
                });
            drawWords();
        });
    } else drawWords();

    function drawWords() {
        var prevColor;

        var texts = mainGroup.selectAll('.word').data(allWords, d => d.id);

        texts.exit().remove();

        var textEnter = texts.enter().append('g')
        .attr('transform', function (d) {
            return 'translate(' + d.x + ', ' + d.y + ')rotate(' + d.rotate + ')';
        })
        .attr("class", "word")
        .append('text')

        textEnter
            .text(function (d) {
                return d.text;
            })
            .attr('id', (d)=>d.id)
            .attr('class', 'textData')
            .attr('font-family', font)
            .attr('font-size', (d)=>d.fontSize)
            .attr('fill', (d, i)=>color(categories.indexOf(d.topic)))
            .attr('fill-opacity', (d)=>opacity(d.sudden))
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('topic', (d)=>d.topic)
            .attr('visibility', (d)=>d.placed?'visible':'hidden')
            // .attr({
            //     "id": d => d.id,
            //     "class": "textData",
            //     'font-family': font,
            //     'font-size': function (d) {
            //         return d.fontSize;
            //     },
            //     "fill": function (d, i) {
            //         return color(categories.indexOf(d.topic));
            //     },
            //     "fill-opacity": function (d) {
            //         return opacity(d.sudden);
            //     },
            //     'text-anchor': 'middle',
            //     'alignment-baseline': 'middle',
            //     topic: function (d) {
            //         return d.topic;
            //     },
            //     visibility: function (d) {
            //         return d.placed ? "visible" : "hidden";
            //     }
            // });

        texts.transition().duration(800)
            .attr({
                transform: function (d) {
                    return 'translate(' + d.x + ', ' + d.y + ')rotate(' + d.rotate + ')';
                }
            })
            .select("text")
            .attr('font-size', function (d) {
                return d.fontSize;
            })
            .attr({
                visibility: function (d) {
                    return d.placed ? "visible" : "hidden";
                }
            });

        // texts.style("text-decoration", "underline");

        mainGroup.selectAll(".connection").on("mouseover", function () {
            var thisLink = d3.select(this);
            thisLink.style('cursor', 'crosshair');
            // in order to select by byid, the id must not have space
            var sourceText = mainGroup.select("#" + thisLink[0][0].__data__.sourceID);
            var prevSourceColor = sourceText.attr("fill");
            var targetText = mainGroup.select("#" + thisLink[0][0].__data__.targetID);
            var prevTargetColor = targetText.attr("fill");

            thisLink.attr("stroke-width", 4);

            sourceText.attr({
                stroke: prevSourceColor,
                fill: prevSourceColor,
                'stroke-width': 1.5
            });

            targetText.attr({
                stroke: prevTargetColor,
                fill: prevTargetColor,
                'stroke-width': 1.5
            });
        });

        mainGroup.selectAll(".connection").on("mouseout", function () {
            var thisLink = d3.select(this);
            thisLink.style('cursor', 'crosshair');
            var sourceText = mainGroup.select("#" + thisLink[0][0].__data__.sourceID);
            var targetText = mainGroup.select("#" + thisLink[0][0].__data__.targetID);

            thisLink.attr("stroke-width", lineScale(thisLink[0][0].__data__.weight));

            sourceText.attr({
                stroke: 'none',
                'stroke-width': 0
            });

            targetText.attr({
                stroke: 'none',
                'stroke-width': 0
            });
        });

        //Highlight
        mainGroup.selectAll('.textData').on('mouseenter', function () {
            var thisText = d3.select(this);
            thisText.style('cursor', 'pointer');
            prevColor = thisText.attr('fill');
            var text = thisText.text();
            var topic = thisText.attr('topic');
            var allTexts = mainGroup.selectAll('.textData').filter(t => {
                return t && t.text === text && t.topic === topic;
            });
            allTexts.attr({
                stroke: prevColor,
                'stroke-width': 1
            });
        });
        mainGroup.selectAll('.textData').on('mouseout', function () {
            var thisText = d3.select(this);
            thisText.style('cursor', 'default');
            var text = thisText.text();
            var topic = thisText.attr('topic');
            var allTexts = mainGroup.selectAll('.textData').filter(t => {
                return t && !t.cloned && t.text === text && t.topic === topic;
            });
            allTexts.attr({
                stroke: 'none',
                'stroke-width': '0'
            });
        });
        //Click
        mainGroup.selectAll('.textData').on('click', function () {
            var thisText = d3.select(this);
            var text = thisText.text();
            var topic = thisText.attr('topic');
            var allTexts = mainGroup.selectAll('.textData').filter(t => {
                return t && t.text === text && t.topic === topic;
            });
            //Select the data for the stream layers
            var streamLayer = d3.select("path[topic='" + topic + "']")[0][0].__data__;
            //Push all points
            var points = Array();
            //Initialize all points
            streamLayer.forEach(elm => {
                points.push({
                    x: elm.x,
                    y0: elm.y0 + elm.y,
                    y: 0//zero as default
                });
            });
            allTexts[0].forEach(t => {
                var data = t.__data__;
                var fontSize = data.fontSize;
                //The point
                var thePoint = points[data.timeStep + 1];
                ;//+1 since we added 1 to the first point and 1 to the last point.
                thePoint.y = -data.streamHeight;
                //Set it to visible.
                //Clone the nodes.
                var clonedNode = t.cloneNode(true);
                d3.select(clonedNode).attr({
                    visibility: "visible",
                    stroke: 'none',
                    'stroke-size': 0,
                });
                var clonedParentNode = t.parentNode.cloneNode(false);
                clonedParentNode.appendChild(clonedNode);

                t.parentNode.parentNode.appendChild(clonedParentNode);
                d3.select(clonedParentNode).attr({
                    cloned: true,
                    topic: topic
                }).transition().duration(300).attr({
                    transform: function (d, i) {
                        return 'translate(' + thePoint.x + ',' + (thePoint.y0 + thePoint.y - fontSize / 2) + ')';
                    },
                });
            });
            //Add the first and the last points
            points[0].y = points[1].y;//First point
            points[points.length - 1].y = points[points.length - 2].y;//Last point
            //Append stream
            wordStreamG.append('path')
                .datum(points)
                .attr('d', area)
                .style('fill', prevColor)
                .attr({
                    'fill-opacity': prevColor,
                    stroke: 'black',
                    'stroke-width': 0.3,
                    topic: topic,
                    wordStream: true
                });
            //Hide all other texts
            var allOtherTexts = mainGroup.selectAll('.textData').filter(t => {
                return t && !t.cloned && t.topic === topic;
            });
            allOtherTexts.attr('visibility', 'hidden');
        });
        topics.forEach(topic => {
            d3.select("path[topic='" + topic + "']").on('click', function () {
                mainGroup.selectAll('.textData').filter(t => {
                    return t && !t.cloned && t.placed && t.topic === topic;
                }).attr({
                    visibility: 'visible'
                });
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

        //Build the legends
        legendGroup.attr('transform', 'translate(' + margins.left + ',' + (height + margins.top + legendOffset) + ')');
        var legendNodes = legendGroup.selectAll('g').data(boxes.topics).enter().append('g')
            .attr('transform', function (d, i) {
                return 'translate(' + 10 + ',' + (i * legendFontSize) + ')';
            });
        legendNodes.append('circle')
        .attr('r', 5)
        .attr('fill', (d, i)=>color(i))
        .attr('fill-opacity', 1)
        .attr('stroke', 'black')
        .attr('stroke-width', 0.5);
        // .attr({
        //     r: 5,
        //     fill: function (d, i) {
        //         return color(i);
        //     },
        //     'fill-opacity': 1,
        //     stroke: 'black',
        //     'stroke-width': .5,
        // });
        legendNodes.append('text').text(function (d) {
            return d;
        })
        .attr('font-size', legendFontSize)
        .attr('alignment-baseline', 'middle')
        .attr('dx', 8)
        // .attr({
        //     'font-size': legendFontSize,
        //     'alignment-baseline': 'middle',
        //     dx: 8
        // });
        // spinner.stop();
    };
}

function styleAxis(axisNodes) {
    axisNodes.selectAll('.domain').attr({
        fill: 'none'
    });
    axisNodes.selectAll('.tick line').attr({
        fill: 'none',
    });
    axisNodes.selectAll('.tick text').attr({
        'font-family': 'serif',
        'font-size': 15
    });
}

function styleGridlineNodes(gridlineNodes) {
    gridlineNodes.selectAll('.domain').attr({
        fill: 'none',
        stroke: 'none'
    });
    gridlineNodes.selectAll('.tick line').attr({
        fill: 'none',
        'stroke-width': 0.7,
        stroke: 'lightgray'
    });
}