/*

Copyright (c) 2010 Nik Kalyani nik@kalyani.com http://www.kalyani.com

Modified work Copyright (c) 2016 Jon Burrows subwaymap@jonburrows.co.uk https://jonburrows.co.uk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

(function ($) {

    var plugin = {

        defaults: {
            debug: false,
            grid: false
        },

        options: {
    },

    identity: function (type) {
        if (type === undefined) type = "name";

        switch (type.toLowerCase()) {
            case "version": return "1.0.0"; break;
            default: return "subwayMap Plugin"; break;
        }
    },
    _debug: function (s) {
        if (this.options.debug)
            this._log(s);
    },
    _log: function () {
        if (window.console && window.console.log)
            window.console.log('[subwayMap] ' + Array.prototype.join.call(arguments, ' '));
    },
    _supportsCanvas: function () {
        var canvas = $("<canvas></canvas>");
        if (canvas[0].getContext)
            return true;
        else
            return false;
    },
    _getCanvasLayer: function (el, overlay) {
        this.layer++;
        var canvas = $("<canvas style='position:absolute;z-Index:" + ((overlay ? 2000 : 1000) + this.layer) + "' width='" + this.options.pixelWidth + "' height='" + this.options.pixelHeight + "'></canvas>");
        el.append(canvas);
        return (canvas[0].getContext("2d"));
    },
    _render: function (el) {

        this.layer = -1;
        var rows = el.attr("data-rows");
        if (rows === undefined)
            rows = 10;
        else
            rows = parseInt(rows);

        var columns = el.attr("data-columns");
        if (columns === undefined)
            columns = 10;
        else
            columns = parseInt(columns);

        var scale = el.attr("data-cellSize");
        if (scale === undefined)
            scale = 100;
        else
            scale = parseInt(scale);

        var lineWidth = el.attr("data-lineWidth");
        if (lineWidth === undefined)
            lineWidth = 10;
        else
            lineWidth = parseInt(lineWidth);

        var textClass = el.attr("data-textClass");
        if (textClass === undefined) textClass = "";

        var grid = el.attr("data-grid");
        if ((grid === undefined) || (grid.toLowerCase() == "false"))
            grid = false;
        else
            grid = true;

        var legendId = el.attr("data-legendId");
        if (legendId === undefined) legendId = "";

        var gridNumbers = el.attr("data-gridNumbers");
        if ((gridNumbers === undefined) || (gridNumbers.toLowerCase() == "false"))
            gridNumbers = false;
        else
            gridNumbers = true;

        var reverseMarkers = el.attr("data-reverseMarkers");
        if ((reverseMarkers === undefined) || (reverseMarkers.toLowerCase() == "false"))
            reverseMarkers = false;
        else
            reverseMarkers = true;


        this.options.pixelWidth = columns * scale;
        this.options.pixelHeight = rows * scale;

        //el.css("width", this.options.pixelWidth);
        //el.css("height", this.options.pixelHeight);
        var self = this;
        var lineLabels = [];
        var supportsCanvas = $("<canvas></canvas>")[0].getContext;
        if (supportsCanvas) {

            if (grid) this._drawGrid(el, scale, gridNumbers);
            $(el).children("ul").each(function (index) {
                var ul = $(this);

                var color = $(ul).attr("data-color");
                if (color === undefined) color = "#000000";

                var outline = $(ul).attr("data-outline");
                if (outline != undefined && ((outline === true) || (outline.toLowerCase() == "true")))
                    outline = true;
                else 
                    outline = false;

                var dotted = $(ul).attr("data-dotted");
                if (dotted != undefined && ((dotted === true) || (dotted.toLowerCase() == "true")))
                    dotted = true;
                else 
                    dotted = false;

                var lineTextClass = $(ul).attr("data-textClass");
                if (lineTextClass === undefined) lineTextClass = "";

                var shiftCoords = $(ul).attr("data-shiftCoords");
                if (shiftCoords === undefined) shiftCoords = "";

                var shiftX = 0.00;
                var shiftY = 0.00;
                if (shiftCoords.indexOf(",") > -1) {
                    shiftX = parseInt(shiftCoords.split(",")[0]) * lineWidth/scale;
                    shiftY = parseInt(shiftCoords.split(",")[1]) * lineWidth/scale;
                }

                var lineLabel = $(ul).attr("data-label");
                if (lineLabel === undefined)
                    lineLabel = "Line " + index;

                lineLabels[lineLabels.length] = {label: lineLabel, color: color, outline: outline, dotted: dotted };

                var nodes = [];
                $(ul).children("li").each(function () {

                    var coords = $(this).attr("data-coords");
                    if (coords === undefined) coords = "";

                    var dir = $(this).attr("data-dir");
                    if (dir === undefined) dir = "";

                    var labelPos = $(this).attr("data-labelPos");
                    if (labelPos === undefined) labelPos = "s";

                    var marker = $(this).attr("data-marker");
                    if (marker == undefined) marker = "";

                    var markerInfo = $(this).attr("data-markerInfo");
                    if (markerInfo == undefined) markerInfo = "";

                    var anchor = $(this).children("a:first-child");
                    var label = $(this).text();
                    if (label === undefined) label = "";

                    var link = "";
                    var title = "";
                    if (anchor != undefined) {
                        link = $(anchor).attr("href");
                        if (link === undefined) link = "";
                        title = $(anchor).attr("title");
                        if (title === undefined) title = "";
                    }

                    self._debug("Coords=" + coords + "; Dir=" + dir + "; Link=" + link + "; Label=" + label + "; labelPos=" + labelPos + "; Marker=" + marker);

                    var x = "";
                    var y = "";
                    if (coords.indexOf(",") > -1) {
                        x = Number(coords.split(",")[0]) + (marker.indexOf("interchange") > -1 ? 0 : shiftX);
                        y = Number(coords.split(",")[1]) + (marker.indexOf("interchange") > -1 ? 0 : shiftY);
                    }
                    nodes[nodes.length] = { x: x, y: y, direction: dir, marker: marker, markerInfo: markerInfo, link: link, title: title, label: label, labelPos: labelPos };
                });

                if (nodes.length > 0) {
                    self._drawLine(el, scale, rows, columns, color, (lineTextClass != "" ? lineTextClass : textClass), lineWidth, nodes, reverseMarkers, dotted);
                    if (outline === true) 
                        self._drawLine(el, scale, rows, columns, '#FFFFFF', false, lineWidth - 2, nodes, reverseMarkers, dotted);
                }
                    
                $(ul).remove();
            });

            if ((lineLabels.length > 0) && (legendId != ""))
            {
                var legend = $("#" + legendId);

                for(var line=0; line<lineLabels.length; line++) {
                 
                    // Prepare SVG param for dotted lines
                    var dottedSVGParam = "";
                    if (lineLabels[line].dotted === true) 
                        dottedSVGParam = "stroke-dasharray='5, 5'";

                    // Create a SVG line
                    var lineSVG = "<line x1='0' y1='3' x2='100' y2='3' stroke-width='"+ (lineWidth + 2)  +"' stroke='" + lineLabels[line].color + "' "+ dottedSVGParam +" />";
                    
                    // We create a second SVG white line to create the outline effect in the legend if required by the "outline" param
                    if (lineLabels[line].outline === true) 
                        lineSVG += "<line x1='0' y1='4' x2='100' y2='4' stroke-width='"+ ( (lineWidth + 2) / 2 ) +"' stroke='#FFFFFF' "+ dottedSVGParam +" />";
                 
                    legend.append("<div><span style='float:left; display:bock;width:100px;height:" + lineWidth + "px;'><svg>" + lineSVG + "</svg></span>" + lineLabels[line].label + "</div>");
                }  
            }

        }
    },
    _drawLine: function (el, scale, rows, columns, color, textClass, width, nodes, reverseMarkers, dotted) {

        var ctx = this._getCanvasLayer(el, false);
        ctx.beginPath();
        ctx.moveTo(nodes[0].x * scale, nodes[0].y * scale);
        var markers = [];
        var lineNodes = [];
        var node;
        for(node = 0; node < nodes.length; node++)
        {
            if (nodes[node].marker.indexOf("@") != 0)
                lineNodes[lineNodes.length] = nodes[node];
        }
        for (var lineNode = 0; lineNode < lineNodes.length; lineNode++) {
            if (lineNode < (lineNodes.length - 1)) {
                var nextNode = lineNodes[lineNode + 1];
                var currNode = lineNodes[lineNode];

                // Correction for edges so lines are not running off campus
                var xCorr = 0;
                var yCorr = 0;
                if (nextNode.x == 0) xCorr = width / 2;
                if (nextNode.x == columns) xCorr = -1 * width / 2;
                if (nextNode.y == 0) yCorr = width / 2;
                if (nextNode.y == rows) yCorr = -1 * width / 2;

                var xVal = 0;
                var yVal = 0;
                var direction = "";

                var xDiff = Math.round(Math.abs(currNode.x - nextNode.x));
                var yDiff = Math.round(Math.abs(currNode.y - nextNode.y));
                if ((xDiff == 0) || (yDiff == 0)) {
                    // Horizontal or Vertical
                    ctx.lineTo((nextNode.x * scale) + xCorr, (nextNode.y * scale) + yCorr);
                }
                else if ((xDiff == 1) && (yDiff == 1)) {
                    // 90 degree turn
                    if (nextNode.direction != "")
                        direction = nextNode.direction.toLowerCase();
                    switch (direction) {
                        case "s": xVal = 0; yVal = scale; break;
                        case "e": xVal = scale; yVal = 0; break;
                        case "w": xVal = -1 * scale; yVal = 0; break;
                        default: xVal = 0; yVal = -1 * scale; break;
                    }
                    ctx.quadraticCurveTo((currNode.x * scale) + xVal, (currNode.y * scale) + yVal,
                                                    (nextNode.x * scale) + xCorr, (nextNode.y * scale) + yCorr);
                }
                else if (xDiff == yDiff) {
                    // Symmetric, angular with curves at both ends
                    if (nextNode.x < currNode.x) {
                        if (nextNode.y < currNode.y)
                            direction = "nw";
                        else
                            direction = "sw";
                    }
                    else {
                        if (nextNode.y < currNode.y)
                            direction = "ne";
                        else
                            direction = "se";
                    }
                    var dirVal = 1;
                    switch (direction) {
                        case "nw": xVal = -1 * (scale / 2); yVal = 1; dirVal = 1; break;
                        case "sw": xVal = -1 * (scale / 2); yVal = -1; dirVal = 1; break;
                        case "se": xVal = (scale / 2); yVal = -1; dirVal = -1; break;
                        case "ne": xVal = (scale / 2); yVal = 1; dirVal = -1; break;
                    }
                    this._debug((currNode.x * scale) + xVal + ", " + (currNode.y * scale) + "; " + (nextNode.x + (dirVal * xDiff / 2)) * scale + ", " +
                    (nextNode.y + (yVal * xDiff / 2)) * scale);
                    ctx.bezierCurveTo(
                            (currNode.x * scale) + xVal, (currNode.y * scale),
                            (currNode.x * scale) + xVal, (currNode.y * scale),
                            (nextNode.x + (dirVal * xDiff / 2)) * scale, (nextNode.y + (yVal * xDiff / 2)) * scale);
                    ctx.bezierCurveTo(
                            (nextNode.x * scale) + (dirVal * scale / 2), (nextNode.y) * scale,
                            (nextNode.x * scale) + (dirVal * scale / 2), (nextNode.y) * scale,
                            nextNode.x * scale, nextNode.y * scale);
                }
                else
                    ctx.lineTo(nextNode.x * scale, nextNode.y * scale);
            }
        }

        if (dotted === true) 
            ctx.setLineDash([5, 5]);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();

        ctx = this._getCanvasLayer(el, true);
        for (node = 0; node < nodes.length; node++) {
            if (textClass != false)
                this._drawMarker(el, ctx, scale, color, textClass, width, nodes[node], reverseMarkers);
        }


    },
    _drawMarker: function (el, ctx, scale, color, textClass, width, data, reverseMarkers) {

        if (data.label == "") return;
        if (data.marker == "") data.marker = "station";

        // Scale coordinates for rendering
        var x = data.x * scale;
        var y = data.y * scale;

        // Keep it simple -- black on white, or white on black
        var fgColor = "#000000";
        var bgColor = "#ffffff";
        if (reverseMarkers)
        {
            fgColor = "#ffffff";
            bgColor = "#000000";
        }

        // Render station and interchange icons
        ctx.strokeStyle = fgColor;
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        switch(data.marker.toLowerCase())
        {
            case "interchange":
            case "@interchange":
                ctx.lineWidth = width;
                if (data.markerInfo == "")
                    ctx.arc(x, y, width * 0.7, 0, Math.PI * 2, true);
                else
                {
                    var mDir = data.markerInfo.substr(0,1).toLowerCase();
                    var mSize = parseInt(data.markerInfo.substr(1,10));
                    if (((mDir == "v") || (mDir == "h")) && (mSize > 1))
                    {
                        if (mDir == "v")
                        {
                            ctx.arc(x, y, width * 0.7,290 * Math.PI/180, 250 * Math.PI/180, false);
                            ctx.arc(x, y-(width*mSize), width * 0.7,110 * Math.PI/180, 70 * Math.PI/180, false);
                        }
                        else
                        {
                            ctx.arc(x, y, width * 0.7,20 * Math.PI/180, 340 * Math.PI/180, false);
                            ctx.arc(x+(width*mSize), y, width * 0.7,200 * Math.PI/180, 160 * Math.PI/180, false);
                        }
                    }
                    else
                        ctx.arc(x, y, width * 0.7, 0, Math.PI * 2, true);
                }
                break;
            case "station":
            case "@station":
                ctx.lineWidth = width/2;
                ctx.arc(x, y, width/2, 0, Math.PI * 2, true);
                break;
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        // Render text labels and hyperlinks
        var pos = "";
        var offset = width + 4;
        var topOffset = 0;
        var centerOffset = "-50px";
        switch(data.labelPos.toLowerCase())
        {
            case "n":
                pos = "text-align: center; margin: 0 0 " + offset + "px " + centerOffset;
                topOffset = offset * 2;
                break;
            case "w":
                pos = "text-align: right; margin:0 " + offset + "px 0 -" + (100 + offset) + "px";
                topOffset = offset;
                break;
            case "e":
                pos = "text-align: left; margin:0 0 0 " + offset + "px";
                topOffset = offset;
                break;
            case "s":
                pos = "text-align: center; margin:" + offset + "px 0 0 " + centerOffset;
                break;
            case "se":
                pos = "text-align: left; margin:" + offset + "px 0 0 " + offset + "px";
                break;
            case "ne":
                pos = "text-align: left; padding-left: " + offset + "px; margin: 0 0 " + offset + "px 0";
                topOffset = offset * 2;
                break;
            case "sw":
                pos = "text-align: right; margin:" + offset + "px 0 0 -" + (100 + offset) + "px";
                topOffset = offset;
                break;
            case "nw":
                pos = "text-align: right; margin: -" + offset + "px 0 0 -" + (100 + offset) + "px";
                topOffset = offset;
                break;
        }
        var style = (textClass != "" ? "class='" + textClass + "' " : "") + "style='" + (textClass == "" ? "font-size:8pt;font-family:Verdana,Arial,Helvetica,Sans Serif;text-decoration:none;" : "") + "width:100px;" + (pos != "" ? pos : "") + ";position:absolute;top:" + (y + el.offset().top - (topOffset > 0 ? topOffset : 0)) + "px;left:" + (x + el.offset().left) + "px;z-index:3000;'";
        if (data.link != "")
            $("<a " + style + " title='" + data.title.replace(/\\n/g,"<br />") + "' href='" + data.link + "' target='_new'>" + data.label.replace(/\\n/g,"<br />") + "</span>").appendTo(el);
        else
            $("<span " + style + ">" + data.label.replace(/\\n/g,"<br />") + "</span>").appendTo(el);

    },
    _drawGrid: function (el, scale, gridNumbers) {

        var ctx = this._getCanvasLayer(el, false);
        ctx.fillStyle = "#000";
        ctx.beginPath();
        var counter = 0;
        for (var x = 0.5; x < this.options.pixelWidth; x += scale) {
            if (gridNumbers)
            {
                ctx.moveTo(x, 0);
                ctx.fillText(counter++, x-15, 10);
            }
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.options.pixelHeight);
        }
        ctx.moveTo(this.options.pixelWidth - 0.5, 0);
        ctx.lineTo(this.options.pixelWidth - 0.5, this.options.pixelHeight);

        counter = 0;
        for (var y = 0.5; y < this.options.pixelHeight; y += scale) {
            if (gridNumbers)
            {
                ctx.moveTo(0, y);
                ctx.fillText(counter++, 0, y-15);
            }
            ctx.moveTo(0, y);
            ctx.lineTo(this.options.pixelWidth, y);
        }
        ctx.moveTo(0, this.options.pixelHeight - 0.5);
        ctx.lineTo(this.options.pixelWidth, this.options.pixelHeight - 0.5);
        ctx.strokeStyle = "#eee";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fill();
        ctx.closePath();

    }
};

var methods = {

    init: function (options) {

        plugin.options = $.extend({}, plugin.defaults, options);
        // iterate and reformat each matched element
        return this.each(function (index) {

            plugin.options = $.meta
                                    ? $.extend(plugin.options, $(this).data())
                                    : plugin.options;

            plugin._debug("BEGIN: " + plugin.identity() + " for element " + index);

            plugin._render($(this));

            plugin._debug("END: " + plugin.identity() + " for element " + index);
        });

    },
    drawLine: function (data) {
        plugin._drawLine(data.element, data.scale, data.rows, data.columns, data.color, data.width, data.nodes);
    }
};

$.fn.subwayMap = function (method) {

    // Method calling logic
    if (methods[method]) {
        return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
        return methods.init.apply(this, arguments);
    } else {
        $.error('Method ' + method + ' does not exist on jQuery.tooltip');
    }

};

})(jQuery);
