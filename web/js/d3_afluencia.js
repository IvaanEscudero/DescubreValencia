d3.csv("./data/afluencia_zonas_valencia.csv").then(data => {
  data.forEach(d => {
    d.personas = +d.personas;
  });

  const allData = data;
  const zonas = Array.from(new Set(data.map(d => d.zona)));
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const margin = { top: 50, right: 100, bottom: 50, left: 60 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

  const svg = d3.select("#chart2")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scalePoint()
    .domain(diasSemana)
    .range([0, width])
    .padding(0.5);

  const y = d3.scaleLinear().range([height, 0]);

  const color = d3.scaleOrdinal(d3.schemeTableau10);

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background", "rgba(0,0,0,0.7)")
    .style("color", "#fff")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("opacity", 0)
    .style("transition", "opacity 0.2s ease");

  function drawChart(filteredZonas) {
    svg.selectAll("*").remove();

    const datosPorZona = zonas
      .filter(z => filteredZonas.includes(z))
      .map(zona => ({
        zona,
        valores: allData
          .filter(d => d.zona === zona)
          .map(d => ({ dia: d.dia, personas: d.personas, zona }))
      }));

    y.domain([
      0,
      d3.max(datosPorZona, d => d3.max(d.valores, v => v.personas))
    ]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));

    const linea = d3.line()
      .x(d => x(d.dia))
      .y(d => y(d.personas))
      .curve(d3.curveMonotoneX);

    const zona = svg.selectAll(".zona")
      .data(datosPorZona, d => d.zona)
      .join("g")
      .attr("class", "zona");

    zona.append("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .attr("d", d => linea(d.valores))
      .attr("stroke", d => color(d.zona))
      .attr("stroke-dasharray", function() {
        const totalLength = this.getTotalLength();
        return `${totalLength} ${totalLength}`;
      })
      .attr("stroke-dashoffset", function() {
        return this.getTotalLength();
      })
      .transition()
      .duration(1000)
      .attr("stroke-dashoffset", 0);

    zona.selectAll("circle")
      .data(d => d.valores)
      .join("circle")
      .attr("r", 4)
      .attr("cx", d => x(d.dia))
      .attr("cy", d => y(d.personas))
      .attr("fill", d => color(d.zona))
      .on("mouseover", function(event, d) {
        d3.select(this).attr("r", 6);
        tooltip
          .style("opacity", 1)
          .html(`<strong>${d.zona}</strong><br>${d.dia}<br>${d.personas} personas`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("r", 4);
        tooltip.style("opacity", 0);
      });
  }

  const container = d3.select("#zona-filtros");
  zonas.forEach(zona => {
    container.append("label")
      .style("background-color", color(zona))
      .style("color", "white")
      .style("margin", "0 5px")
      .style("padding", "4px 8px")
      .style("border-radius", "4px")
      .html(`<input type="checkbox" checked value="${zona}"> ${zona}`);
  });

  container.selectAll("input").on("change", () => {
    const zonasSeleccionadas = [];
    container.selectAll("input").each(function() {
      if (this.checked) zonasSeleccionadas.push(this.value);
    });
    drawChart(zonasSeleccionadas);
  });

  drawChart(zonas);
});
