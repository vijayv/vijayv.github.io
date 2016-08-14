---
layout: post
title: Premier League Head to Head
---
<style>

#circle circle {
fill: none;
pointer-events: all;
}

.group path {
fill-opacity: .5;
}

.chord {
  fill-opacity: .8;
}

#circle:hover path.fade {
  fill-opacity: .1;
  line-height: 0;
}

</style>
<body>

<div id="title">
  <p>A d3 chord diagram of the English Premier League's top 5 (arguably) teams and the number of wins they've recorded over each other in their respective histories.</p>
</div>

<div id="instructions">
  <h3>Helpful Tips</h3>
    <ul>
      <li>The color of each band represents the team that has the most wins in that respective head-to-head match up.</li>
      <li>Hover over each team's name to find identify that teams record with each of the other teams.</li>
      <li>Hover over each chord to see a tool-tip of the head-to-head stats between the two teams.</li>
      <li>The size of each wedge is representative of the total number of games that team has won against the others in the top 5. </li>
    </ul>
    <p>Data was gathered from <a href="http://www.arsenal-world.co.uk/head_to_head/manchester_city/vs/liverpool/index.shtml"> this location</a>.</p>
</div>

<div id="chart">
</div>

<script src="http://d3js.org/d3.v3.min.js"></script>
<script>
  // From http://mkweb.bcgsc.ca/circos/guide/tables/
  var matrix = [
    [0, 66, 74, 89, 71], // Arsenal
    [55, 0, 46, 57, 57], // Chelsea
    [88, 68, 0, 69, 70], // Man Utd
    [33, 33, 45, 0, 41], // Man City
    [53, 49, 60, 82, 0] // Liverpool
  ];

  // Create SVG Element
  var width = 550;
  var height = 550;
  var svg = d3.select("#chart")
       .append("svg")
       .attr("width", width)
       .attr("height", height)
       .append("g")
       .attr("id", "circle")
       .attr("transform","translate(" + width / 2 + "," + height / 2 + ")");

  // Create Range and Scale
  var range = ["#840100", "#0139CF", "#E41023", "#009FCF", "#D68901"];
  var fill = d3.scale.ordinal()
         .domain(d3.range(range.length))
         .range(range);

  var innerRadius = Math.min(width, height) * .4;
  var outerRadius = innerRadius * 1.15;

  var path = d3.svg.chord()
    .radius(innerRadius);

  svg.append("circle")
    .attr("r", outerRadius);

  var layout = d3.layout.chord()
    .padding(.05)
    .sortSubgroups(d3.descending)
    .matrix(matrix);

  // Add a group per Team.
  var group = svg.selectAll(".group")
    .data(layout.groups)
    .enter().append("g")
    .attr("class", "group")
    .on("mouseover", fade(.1))
    .on("mouseout", fade(1));

  var groupPath = group.append("path")
  .attr("id", function(d, i) { return "group" + i; })
  .style("fill", function(d) {
      return fill(d.index);
  })
  .style("stroke", function(d) {
      return fill(d.index);
  })
  .attr("d", d3.svg.arc()
     .innerRadius(innerRadius)
     .outerRadius(outerRadius))

  var teams = ["Arsenal", "Chelsea", "Man United", "Man City", "Liverpool"];

  // Add a text label.
  var groupText = group.append("text")
    .attr("dx", 10 )
    .attr("dy", 25)
    .attr("font-size", "1.1em")
    .attr("color", "white");

  groupText.append("textPath")
    .attr("xlink:href", function(d, i) { return "#group" + i; })
    .text(function(d, i) { return teams[i]; });

  // Add the chords.
  var chord = svg.selectAll(".chord")
    .data(layout.chords)
    .enter().append("path")
    .attr("class", "chord")
    .style("fill", function(d, i) {
            return fill(d.source.index);
      })
    .style("stroke", function(d, i) {
            return fill(d.source.index);
       })
    .attr("d", path);

  // Add an elaborate mouseover title for each chord.
   chord.append("title").text(function(d) {
     return teams[d.source.index]
     + " has beaten " + teams[d.target.index]
     +  " " + d.source.value + " times."
     + "\n" + teams[d.target.index]
     + " has beaten " + teams[d.source.index]
     +  " " + d.target.value + " times.";
   });

  function fade(opacity) {
      return function(g, i) {
        svg.selectAll(".chord")
          .filter(function(d) {
              return d.source.index != i && d.target.index != i;
          })
          .transition()
          .style("opacity", opacity);
      };
  };
</script>
</body>
