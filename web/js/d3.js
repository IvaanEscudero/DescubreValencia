d3.json("data/population.json").then(function(data) {

data.sort((a, b) => b.poblacion - a.poblacion);

const container = d3.select("#chart").node().getBoundingClientRect();
const margin = { top: 20, right: 20, bottom: 60, left: 60 },
            width  = container.width - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

  const x = d3.scaleBand()
              .domain(data.map(d => d.distrito))
              .range([0, width])
              .padding(0.1);

  const y = d3.scaleLinear()
              .domain([0, d3.max(data, d => d.poblacion)]).nice()
              .range([height, 0]);

  const color = d3.scaleSequential()
                  .domain([d3.min(data, d => d.poblacion), d3.max(data, d => d.poblacion)])
                  .interpolator(d3.interpolateBlues);

  const svg = d3.select("#chart")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const tooltip = d3.select("body")
    .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "rgba(0,0,0,0.7)")
      .style("color", "#fff")
      .style("padding", "6px 10px")
      .style("border-radius", "4px")
      .style("opacity", 0)
      .style("transition", "opacity 0.2s ease");

  function drawBars(data) {
    const bars = svg.selectAll(".bar")
      .data(data, d => d.distrito);

    bars.exit()
        .transition().duration(500)
        .attr("y", y(0))
        .attr("height", 0)
        .remove();

    bars.transition().duration(750)
        .attr("x", d => x(d.distrito))
        .attr("y", d => y(d.poblacion))
        .attr("height", d => height - y(d.poblacion))
        .attr("width", x.bandwidth())
        .attr("fill", d => color(d.poblacion));

    bars.enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.distrito))
        .attr("y", y(0))
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", d => color(d.poblacion))
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition().duration(200)
          .attr("fill", d3.rgb(color(d.poblacion)).darker(1));
        tooltip
          .style("opacity", 1)
          .html(`<strong>${d.distrito}</strong><br/>Población: ${d.poblacion.toLocaleString()}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .transition().duration(200)
          .attr("fill", color(d.poblacion));
        tooltip
          .style("opacity", 0);
      })
    .transition().duration(800)
      .attr("y", d => y(d.poblacion))
      .attr("height", d => height - y(d.poblacion));
  }

  svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("y", 10)
      .attr("x", -5)
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

  svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));

  drawBars(data);
});


