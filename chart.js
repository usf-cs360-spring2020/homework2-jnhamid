

//function that shuffles an array
function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

// Set the dimensions and margins of the SVG
var margin = {
    top: 50,
    right: 5,
    bottom: 5,
    left: 5
  },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// Creating the svg
var svg = d3.select("#chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data from a reduced set of the original data. Reducing was done with a python script.
d3.csv("data.csv").then(function(data) {


  shuffle(data);

  data = data.slice(0,100);

  // This extracts the columns that we want
  dimensions = d3.keys(data[0]).filter(function(d) {
    return (["female", "tier", "par_mean", "k_mean"].includes(d));
  })

    var keys = ["CA", "NY"];

  //This line swaps the dimensionsso that I get the format I desire.
  [dimensions[0], dimensions[1]] = [dimensions[1], dimensions[0]];
  [dimensions[2], dimensions[3]] = [dimensions[3], dimensions[2]];

  // Building a scale for each dimension that we will use
  var y = {}
  for (i in dimensions) {
    name = dimensions[i]
    y[name] = d3.scaleLinear()
      .domain(d3.extent(data, function(d) {
        return +d[name];
      }))
      .range([height, 0])
      .nice()
  }
  // Building the x scale
  x = d3.scalePoint()
    .range([0, width])
    .padding(1)
    .domain(dimensions);

  function path(d) {
    return d3.line()(dimensions.map(function(p) {
      return [x(p), y[p](d[p])];
    }));
  }



  //Add color slace
  var z = d3.scaleOrdinal()
  		.range(["#bf6969", "#69bfbf"])
  		.domain(keys);

  // Draw the lines
  svg
    .selectAll("myPath")
    .data(data)
    .enter().append("path")
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", d => z(d.state))
    .style("opacity", 0.3)

  // Axis drawing
  svg.selectAll("myAxis")
    .data(dimensions).enter()
    .append("g")
    .attr("transform", function(d) {
      return "translate(" + x(d) + ")";
    })
    .each(function(d) {
      d3.select(this).call(d3.axisLeft().scale(y[d]));
    })
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function(d) {
      switch (d) {
        case "tier":
          return "School Tier";
        case "female":
          return "Female to Male Ratio";
        case "par_mean":
          return "Parental Mean Income";
        case "k_mean":
          return "Kid Mean Income";
        default:
          return d;
      }
    })
    .style("fill", "black")

    var size = 20;

    svg.selectAll("mydots")
      .data(keys)
      .enter()
      .append("rect")
        .attr("x", 80)
        .attr("y", function(d,i){ return 40 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .attr("fill", d => z(d))
        // .style("fill", function(d){ return z(d))};
    svg.selectAll("mylabels")
    .data(keys)
    .enter()
    .append("text")
      .attr("x", 80 + size*1.2)
      .attr("y", function(d,i){ return 40 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
      .style("fill", function(d){ return keys[d]})
      .text(function(d){ return d})
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
      .style("font-weight", 300)


  svg.append("text").attr("id","legendtitle")
   .attr("x", 80 + size*1.2)
   .attr("y", function(d,i){ return 30 + i*(size+5)})
   .style("text-anchor", "middle")
   .style("font-weight", 500)
   .text("State")
    svg
    .append("text")
    .attr("id", "charttitle")
     .attr("x",  125 )
     .attr("y", -25)
     .style("text-anchor", "left")
     .style("font-weight", 700)
     .style("font-size", "16px")
     .text("CA vs NY: How College Tier Ranks up with Female ratio, Parent Mean Salary, and Kid Mean Salary")

});
