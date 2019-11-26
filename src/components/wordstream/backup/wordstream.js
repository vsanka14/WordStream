import * as d3 from 'd3';

export default function wordStream(data) {
    let size = [1200, 800],
        maxFontSize = 24,
        minFontSize = 10,
        fontSizeScale = null,
        streamSizeScale = null,
        wordStream = {},
        topics = Object.keys(data[0].words),
        cloudRadians = Math.PI / 180, 
        toDegree = 180 / Math.PI,
        cw = 1 << 14,
        ch = 1 << 11,
        font = "Arial",
        spiral = achemedeanSpiral,
        maxSud, minSud, maxFreq;

    wordStream.buildScales = function() {
        fontSizeScale = generateFontSizeScale(data);
        streamSizeScale = generateStreamSizeScale(data);
    }
    
    wordStream.boxes = function (){
        let boxes = buildBoxes(data);
        getImageData(boxes)
        for(var tc = 0; tc< boxes.topics.length; tc++){
            var topic = boxes.topics[tc];
            var board = buildBoard(boxes, topic);
            var innerBoxes = boxes.innerBoxes[topic];
            //Place
            for(var bc = 0; bc < boxes.data.length; bc++){
                var words = boxes.data[bc].words[topic];
                var n = words.length;
                var innerBox = innerBoxes[bc];
                board.boxWidth = innerBox.width;
                board.boxHeight = innerBox.height;
                board.boxX = innerBox.x;
                board.boxY = innerBox.y;
                for(var i = 0; i < n; i++){
                    place(words[i], board, bc);
                }
            }
        }
        return boxes;
    }

    function generateFontSizeScale() {
        let max = 0, min = Math.pow(10, 1000);
        data.forEach(box=>{
            topics.forEach(topic=>{
                let i = 0, j = Math.pow(10, 1000);
                box.words[topic].forEach(word=>{
                    if(word.sudden>i) i = word.sudden;
                    if(word.sudden<j) j = word.sudden;
                });
                if(i>max) max = i;
                if(j<min) min = j;
            });
        });
        return d3.scaleLinear().domain([min, max]).range([minFontSize, maxFontSize]).nice();
    }

    function generateStreamSizeScale() {
        let totalFrequenciesPerPeriod = calculateTotalFrequenciesPerPeriod();
        let frequencyVals = d3.nest().key(function(d) {
            return d.date;
          })
          .rollup(function(leaves) {
            return d3.sum(leaves, (d) => {
                let perPeriodSum = 0;
                topics.forEach(topic=>perPeriodSum+=d[topic]);
                return perPeriodSum;
            });
          }).entries(totalFrequenciesPerPeriod)
          .map(function(d) {
            return {
              date: d.key,
              totalValue: d.value
            };
          });
        let maxPeriodFreq = d3.max(frequencyVals, d=>d.totalValue);
        return d3.scaleLinear().domain([-maxPeriodFreq, maxPeriodFreq]).range([0, size[1]]).nice();
    }

    function calculateTotalFrequenciesPerPeriod(){
        let arr = [];
        data.forEach(item=>{
            let obj = {};
            obj['date']=item.date;
            topics.forEach(topic=>{
                obj[topic] = d3.sum(item.words[topic],d=>parseInt(d.sudden));
            });
            arr.push(obj);
        });
        return arr;
    }

    function buildBoxes() {
        let totalFrequencies = calculateTotalFrequenciesPerPeriod(data),
            numberOfBoxes = data.length,
            boxes = {},
            boxWidth =  (size[0]/numberOfBoxes);
        totalFrequencies.unshift(totalFrequencies[0]);
        let stackedLayers = d3.stack().offset(d3.stackOffsetSilhouette).keys(topics)(totalFrequencies);
        let innerBoxes = {};
        topics.forEach((topic, i)=>{
            innerBoxes[topic] = [];
            stackedLayers[i].forEach(layer=>{
                innerBoxes[topic].push({
                    x: layer.data.date,
                    y: streamSizeScale(layer[0]),
                    width: boxWidth,
                    height: streamSizeScale(layer[1]) - streamSizeScale(layer[0])
                });
            });
        });
        boxes = {
            topics: topics,
            data: data,
            layers: stackedLayers,
            innerBoxes: innerBoxes
        };
        return boxes;
    }

    //to be modified
    function getContext(canvas) {
        canvas.width = cw;
        canvas.height = ch;
        var context = canvas.getContext("2d");
        context.fillStyle = context.strokeStyle = "red";
        context.textAlign = "center";
        context.textBaseline = "middle";
        return context;
    }

    //to be modified
    function getImageData(boxes){
        var av = 0;
        var flow = 0;
        var data = boxes.data;
        var c = getContext(document.createElement("canvas"));
        c.clearRect(0, 0, cw, ch);
        var x = 0,
            y = 0,
            maxh = 0;
        for(var i = 0; i < data.length; i++){
            boxes.topics.forEach(topic =>{
                var words = data[i].words[topic];
                var n = words.length;
                var di=-1;
                var d = {};
                while (++di < n) {
                    d = words[di];
                    c.save();
                    d.fontSize = ~~fontSizeScale(d.sudden);
                    d.rotate = (~~(Math.random() * 4) - 2) * av - flow;
                    c.font = ~~(d.fontSize + 1) + "px " + font;
                    var w = ~~(c.measureText(d.text).width),
                        h = d.fontSize;
                    if (h > maxh) maxh = h;
                    if (x + w >= cw) {
                        x = 0;
                        y += maxh;
                        maxh = 0;
                    }
                    if (y + h >= ch) break;
                    c.translate((x + (w >> 1)) , (y + (h >> 1)));
                    if (d.rotate) c.rotate(d.rotate * cloudRadians);
                    c.fillText(d.text, 0, 0);
                    if (d.padding) {
                        c.lineWidth = (2 * d.padding, c.strokeText(d.text, 0, 0))
                    };
                    c.restore();

                    d.width = w;
                    d.height = h;
                    d.x = x;
                    d.y = y;
                    d.x1 = w>>1;
                    d.y1 = h>>1;
                    d.x0 = -d.x1;
                    d.y0 = -d.y1;
                    d.timeStep = i;
                    // d.streamHeight = streamSizeScale(d.frequency);
                    x += w;
                }
            });
        }
    
    for(var bc = 0; bc < data.length; bc++){
        boxes.topics.forEach(topic=>{
            var words = data[bc].words[topic];
            var n = words.length;
            var di=-1;
            var d = {};
            while (++di < n) {
                d = words[di];

                var pixels = c.getImageData(d.x, d.y, d.width, d.height).data;
                d.sprite = Array();
                for(var i = 0; i<<2 < pixels.length; i++){
                    d.sprite.push(pixels[i<<2]);
                }
            }
        });
    }
    //Only return this to test if needed
    return c.getImageData(0, 0, cw, ch);
    }

    function buildSvg(boxes, topic){
        let streamPath1 = Array(),
            streamPath2 = Array();
        var width = size[0],
            height = size[1];
        var svg = d3.select(document.createElement('svg'));
        svg
        .attr('width', width)
        .attr('height', height);
        var graphGroup = svg.append('g');

        var catIndex = boxes.topics.indexOf(topic);

        var area1 = d3.area()
            .curve(d3.curveLinear)
            .x(function(d, i){return (i)*100; })
            .y0(0)
            .y1(function(d){return streamSizeScale(d[0]); });

        var area2 = d3.area()
            .curve(d3.curveLinear)
            .x(function(d, i){return (i)*100 })
            .y0(function(d){return (streamSizeScale(d[1])); })
            .y1(height);
        graphGroup.append('path').datum(boxes.layers[catIndex])
            .attr('d', area1)
            .attr('stroke', 'red')
            .attr('stroke-width', 2)
            .attr('fill', 'red')
            .attr('id', 'path1');
        graphGroup.append('path').datum(boxes.layers[catIndex])
            .attr('d', area2)
            .attr('stroke', 'red')
            .attr('stroke-width', 2)
            .attr('fill', 'red')
            .attr('id', 'path2');
        return svg;
    }

    function buildCanvas(boxes, topic){
        var svg = buildSvg(boxes, topic);
        var path1 = svg.select("#path1").attr('d');
        var p2d1 = new Path2D(path1);
        var path2 = svg.select("#path2").attr('d');
        var p2d2 = new Path2D(path2);
        var canvas = document.createElement("canvas");
        // document.querySelector('body').appendChild(canvas);
        canvas.width = size[0];
        canvas.height = size[1];
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = 'red';
        ctx.fill(p2d1);
        ctx.fill(p2d2);
        return canvas;
    }

    function buildBoard(boxes, topic){
        var canvas = buildCanvas(boxes,topic);
        var width = canvas.width,
            height = canvas.height;
        var board = {};
        board.x = 0;
        board.y = 0;
        board.width = width;
        board.height = height;
        var sprite = [];
        //initialization
        for(var i=0; i< width*height; i++) sprite[i] = 0;
        var c = canvas.getContext('2d');
        var pixels = c.getImageData(0, 0, width, height).data;
        let res = 0;
        for(var i=0; i< width*height; i++){
            res++;
            sprite[i] = pixels[i<<2];
        }
        board.sprite = sprite;
        return board;
    }

    function place(word, board, bc){
        var bw = board.width,
            bh = board.height,
            maxDelta = ~~Math.sqrt((board.boxWidth*board.boxWidth) + (board.boxHeight*board.boxHeight)),
            startX = (bc+1)*board.boxWidth,
            // startX =  ~~(board.boxX + (board.boxWidth*( Math.random() + .5) >> 1)),
            startY =  ~~(board.boxY + (board.boxHeight*( Math.random() + .5) >> 1)),
            s = spiral([board.boxWidth, board.boxHeight]),
            dt = Math.random() < .5 ? 1 : -1,
            t = -dt,
            dxdy, dx, dy;
        word.x = startX;
        word.y = startY;
        word.placed = false;
        while (dxdy = s(t += dt)) {

            dx = ~~dxdy[0];
            dy = ~~dxdy[1];

            if (Math.max(Math.abs(dx), Math.abs(dy)) >= (maxDelta))
                break;

            word.x = startX + dx;
            word.y = startY + dy;

            if (word.x + word.x0 < 0 || word.y + word.y0 < 0 || word.x + word.x1 > size[0] || word.y + word.y1 > size[1])
                continue;
            if(!cloudCollide(word, board)){
                placeWordToBoard(word, board);
                word.placed = true;
                break;
            }
        }
    }

    function cloudCollide(word, board) {
        var wh = word.height,
            ww = word.width,
            bw = board.width;
        //For each pixel in word
        for(var j = 0; j < wh; j++){
            for(var i = 0; i < ww; i++){
                var wsi = j*ww + i; //word sprite index;
                var wordPixel = word.sprite[wsi];

                var bsi = (j+word.y+word.y0)*bw + i+(word.x + word.x0);//board sprite index
                var boardPixel = board.sprite[bsi];

                if(boardPixel!=0 && wordPixel!=0){
                    return true;
                }
            }
        }
        return false;
    }

    function placeWordToBoard(word, board){
        //Add the sprite
        var y0 = word.y + word.y0,
            x0 = word.x + word.x0,
            bw = board.width,
            ww = word.width,
            wh = word.height;
        for(var j=0; j< wh; j++){
            for(var i = 0; i< ww; i++){
                var wsi = j*ww + i;
                var bsi = (j+y0)*bw + i + x0;
                if(word.sprite[wsi]!=0) board.sprite[bsi] = word.sprite[wsi];
            }
        }
    }

    function achemedeanSpiral(size){
        var e = size[0]/size[1];
        return function(t){
            return [e*(t *= .1)*Math.cos(t), t*Math.sin(t)];
        }
    };

    wordStream.streamSizeScale = () => streamSizeScale;
    wordStream.minSud = () => minSud;
    wordStream.maxSud = () => maxSud;
    return wordStream;
}   
