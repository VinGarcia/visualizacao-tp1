// Plot all charts on the screen.
function drawCharts(graph, graphID, canvasSide) {
  // Clean old charts before drawing again.
  d3.selectAll("div").remove();

  // Data source definition.
  var people = d3.nest()
      .key(function(d) { return d.id; })
      .entries(graph);

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.numVisits; });

  // Canvas and chart dimensions.
  var radius = Math.ceil(canvasSide/10);
  var outlierRadius = Math.ceil(canvasSide/14);
  var donutWidth = Math.ceil(radius/3);

  // Arc definition. Outlier arcs are smaller.
  var arc = d3.svg.arc()
      .innerRadius(function(d) {
         return (d.data.isOutlier) ? outlierRadius : radius ;
      })
      .outerRadius(function(d) {
         return ((d.data.isOutlier) ? outlierRadius : radius) - donutWidth ;
      });

  // Add a canvas to the center of the page.
  var mainDiv = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("top", "0")
      .style("left", "0")
      .style("right", "0")
      .style("margin", "auto")
      .style("width", canvasSide + "px")
      .style("height", canvasSide + "px");

  // Add one div per chart, setting its coordinates.
  var svg = mainDiv
      .selectAll("div")
      .data(people)
      .enter().append("div") 
      .style("position", "absolute")
      .style("top", function(d) { return "" + (d.values[0].y - radius) + "px"; })
      .style("left", function(d) { return "" + (d.values[0].x - radius) + "px"; })
      .style("width", radius * 2 + "px")
      .style("height", radius * 2 + "px")
      // Draw the actual chart in each div.
      .append("svg:svg")
      .attr("width", radius * 2)
      .attr("height", radius * 2)
      .append("svg:g")
      .attr("transform", "translate(" + radius + "," + radius + ")");

  // Create a base SVG to hold all edges.
  var baseSVG = mainDiv.append("svg")
      .attr("width", Math.ceil(canvasSide*1.5))
      .attr("height", canvasSide)
      .attr("id", "baseSVG");

  var canvasRadius = Math.ceil(canvasSide/2);

  // Draw the circular plotting frontier in the canvas.
  baseSVG.append("circle")
      .attr("cx", canvasRadius)
      .attr("cy", canvasRadius)
      .attr("r", canvasRadius-1)
      .style("stroke", "black")
      .style("fill", "none");

  // Prevent edged from overlapping the person ID by inserting a white circle
  // over it.
  svg.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 10)
      .attr("fill", "white");

  // Put the person ID at the center of the chart.
  svg.append("svg:text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.key; });

  // Tooltip text box.
  var tooltipDiv = d3.select("body").append("div")
      .attr("class", "tooltip")
      .attr("id", "tooltip_box")
      .style("opacity", 0);

  redrawEdges(graphID);

  // Fill each chart with data.
  var g = svg.selectAll("g")
      .data(function(d) { return pie(d.values[0].getVisitArray()); })
      .enter().append("svg:g")
      // Sets the tooltip content for this arc.
      .on("mouseover", function(d) {
          tooltipDiv.transition()
          .duration(200)
          .style("opacity", .95);
          tooltipDiv.html("Número de visitas: " + d.data.numVisits +
                          "</br>Percentual: " + d.data.percentage + "%")
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltipDiv.transition()
              .duration(200)
              .style("opacity", 0);
      });

  var z = d3.scale.category20c();

  // Set arcs color.
  g.append("svg:path")
      .attr("d", arc)
      .style("fill", function(d) { return z(d.data.placeType); })
      .append("svg:title")
      .text(function(d) { return d.data.place + ": " + d.data.placeID; });

  // Put the arc text (place type) in the appropriate place.
  g.filter(function(d) { return d.endAngle - d.startAngle > .2; }).append("svg:text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")rotate(" + angle(d) + ")"; })
      .text(function(d) { return d.data.placeType; });

  function angle(d) {
    var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
    return a > 90 ? a - 180 : a;
  }
}

function redrawEdges(graphID) {
  var edgeThreshold = document.getElementById("edgeThreshold").value / 100;
  var baseSVG = d3.select("#baseSVG");
  var tooltipDiv = d3.select("#tooltip_box");

  // Remove old edges before redrawing.
  d3.selectAll("line").remove();

  // Draw one edge for each chart.
  for (var i = 0; i < analyzer.edgeVector[graphID].length; i++) {
    var edge = analyzer.edgeVector[graphID][i];

    // Ignore edges bellow the threshold.
    if (edge.percentMatch < edgeThreshold)
      continue;

    baseSVG.append("line")
      .attr("x1", edge.x1)
      .attr("y1", edge.y1)
      .attr("x2", edge.x2)
      .attr("y2", edge.y2)
      .attr("stroke-width", 2)
      .attr("stroke", "black")
      // Add label tooltip.
      .on("mouseover", function() {
          tooltipDiv.transition()
          .duration(200)
          .style("opacity", .95);
          tooltipDiv.html(edge.label)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
          tooltipDiv
          .style("width", (edge.label.length * 6) + "px")
          .style("height", "12px")
      })
      .on("mouseout", function() {
          tooltipDiv.transition()
              .duration(200)
              .style("opacity", 0)
              .style("width", "115px")
              .style("height", "24px")
      });
  }
}

// Set the range and behavior of the graph ID input and its controls. Also, set
// the threshold edge input.
function buildGraphinput() {
  var input = document.getElementById("graphID");

  // Set the selection range.
  document.getElementById("graphID").
    setAttribute("max", (inputParser.graphs.length -1).toString());

  // Display first graph when loaded.
  window.onload = function() {
    drawCharts(inputParser.graphs[document.getElementById("graphID").value],
               document.getElementById("graphID").value, canvasSide);
  }

  // Change the graph being displayed when input changes.
  input.onchange = function() {
    drawCharts(inputParser.graphs[document.getElementById("graphID").value],
               document.getElementById("graphID").value, canvasSide);
  }

  // Set controls.
  var sd = document.getElementById("stepdown").onclick = function() {
    input.stepDown(1);
    input.onchange();
  };

  var sd = document.getElementById("stepup").onclick = function() {
    input.stepUp(1);
    input.onchange();
  };

  // Set edge threshold input.
  var edgeThInput = document.getElementById("edgeThreshold");

  edgeThInput.onchange = function() {
    redrawEdges(document.getElementById("graphID").value);
  };

  // Set controls.
  var sd = document.getElementById("stepdown_thr").onclick = function() {
    edgeThInput.stepDown(1);
    edgeThInput.onchange();
  };

  var sd = document.getElementById("stepup_thr").onclick = function() {
    edgeThInput.stepUp(1);
    edgeThInput.onchange();
  };
}
