
  var margin = { top: 80, right: 30, bottom: 50, left: 50 };
  var cellSize=15;
  var col_number=26;
  var row_number=833;
  var width = cellSize*row_number; // - margin.left - margin.right,
  var height = cellSize*col_number; // - margin.top - margin.bottom,
    //gridSize = Math.floor(width / 26),
  var legendElementWidth = cellSize*3;
  var colors = ["#ffffd9","#edf8b1","#c7e9b4","#41b6c4","#1d91c0","#253494","#081d58"]; // alternatively colorbrewer.YlGnBu[9]

  var places = ["A","B","C","D","E","F","G","H","I",
              "J","K","L","M","N","O","P","Q","R",
              "S","T","U","V","W","X","Y","Z"]

  var people = []
  for(var i=1; i<=833; i++) people.push(i);

  var letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  d3.tsv("data.tsv",
  
  function(d) {
    return {
      number: +d.number,
      graph: +d.graph,
      person: +d.person,
      place: d.place,
      freq: +d.freq,
    };
  },

  function(error, data) {

    //var dm = distMatrix(data)
		//var matrix = dm[0];
		//var persons = dm[1];

		//var sorted = simSort(persons, matrix);

    var colorScale = d3.scale.quantile()
        .domain([0,1,2,3,4,5,6])
        .range(colors);

    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var count=0;
    var dayLabels = svg.selectAll(".dayLabel")
          .data(people)
          .enter().append("text")
          .text(function (d) { return '('+sorted[d-1].graph + ',' + sorted[d-1].person + ')'; })
          .attr("x", 0)
          .attr("y", function (d, i) { return i * cellSize; })
          .style("text-anchor", "left")
          .attr("transform", "translate("+cellSize/2 + ",-6) rotate (-90)")
          .attr("class",  function (d,i) { return "colLabel mono c"+i;} )
		      .on("mouseover", function(d) {
						d3.select(this).classed("text-hover",true);

					  //Update the tooltip position and value
					  d3.select("#tooltip")
						.style("left", (d3.event.pageX+10) + "px")
						.style("top", (d3.event.pageY-10) + "px")
						.select("#value")
						.text(function(){
						return 'Grafico: '+sorted[d-1].graph+'\n'+'Pessoa: '+sorted[d-1].person;
						});
					  //Show the tooltip
						d3.select("#tooltip").classed("hidden", false);
					})
					.on("mouseout", function(d) {
						d3.select(this).classed("text-hover",false);
						d3.select("#tooltip").classed("hidden", true);
					})


    var timeLabels = svg.selectAll(".timeLabel")
          .data(places)
          .enter().append("text")
          .text(function(d) { return d; })
          .attr("y", function(d, i) { return i * cellSize; })
          .attr("x", 0)
          .style("text-anchor", "middle")
          .attr("transform", "translate(-6," + cellSize / 1.5 + ")")
          .attr("class", function (d,i) { return "rowLabel mono r"+i;} );


    var heatMap = svg.selectAll(".hour")
        .data(data)
        .enter()
        .append("rect")
        .attr("y", function(d) { return (letras.indexOf(d.place)) * cellSize; })
        .attr("x", function(d) { return (persons[d.number].sorted_x) * cellSize; })
        .attr("rx", 2)
        .attr("ry", 2)
        .attr("class", "hour bordered")
        .attr("width", cellSize)
        .attr("height", cellSize)
        .style("fill", function(d) { return colorScale(d.freq); })
		    .on("mouseover", function(d) {
					d3.select(this).classed("text-hover",true);

				  //Update the tooltip position and value
				  d3.select("#tooltip")
					.style("left", (d3.event.pageX+10) + "px")
					.style("top", (d3.event.pageY-10) + "px")
					.select("#value")
					.text(function(){
					  return 'Grafico: '+d.graph+'\n'+'Pessoa: '+d.person;
					});
				  //Show the tooltip
					d3.select("#tooltip").classed("hidden", false);
				})
				.on("mouseout", function(d) {
					d3.select(this).classed("text-hover",false);
					d3.select("#tooltip").classed("hidden", true);
				})

    heatMap.transition().duration(10)
        .style("fill", function(d) { return colorScale(d.freq); });

    heatMap.append("title").text(function(d) { return d.freq; });
        
    var legend = svg.selectAll(".legend")
         .data([0,1,2,3,4,5,d3.max(data, function (d) { return d.freq;})])
         .enter().append("g")
         .attr("class", "legend");


     legend.append("rect")
       .attr("x", function(d, i) { return legendElementWidth * i; })
       .attr("y", height)
       .attr("width", legendElementWidth)
       .attr("height", cellSize / 2)
       .style("fill", function(d, i) { return colors[i]; });

     legend.append("text")
       .attr("class", "mono")
       .text(function(d) { return "≥ " + Math.round(d); })
       .attr("x", function(d, i) { return legendElementWidth * i; })
       .attr("y", height + 20);

});
