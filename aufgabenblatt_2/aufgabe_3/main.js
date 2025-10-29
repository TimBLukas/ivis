function parsePopulation(num) {
  var lastChar = num.slice(-1);
  if (lastChar == "B") {
    return parseFloat(num.substring(0, num.length - 1)) * 1_000_000_000;
  } else if (lastChar == "M") {
    return parseFloat(num.substring(0, num.length - 1)) * 1_000_000;
  } else if (lastChar == "k") {
    return parseFloat(num.substring(0, num.length - 1)) * 1_000;
  } else {
    return parseInt(num);
  }
}

d3.csv("gapminder.csv").then(
  function (dataset) {
    // Konstanten für Größen Angaben definierej
    const svgWidth = 700;
    const svgHeight = 500;
    const margin = {
      top: 20,
      right: 30,
      bottom: 30,
      left: 100,
    };

    let xParam = "Average Daily Income";
    let yParam = "Babies per Woman";
    let rParam = "Population";
    let colorParam = "world_4region";

    let minX = d3.min(dataset, (d) => parseFloat(d[xParam]));
    let maxX = d3.max(dataset, (d) => parseFloat(d[xParam]));

    let minY = d3.min(dataset, (d) => parseFloat(d[yParam]));
    let maxY = d3.max(dataset, (d) => parseFloat(d[yParam]));

    let minR = d3.min(dataset, (d) => parsePopulation(d[rParam]));
    let maxR = d3.max(dataset, (d) => parsePopulation(d[rParam]));

    console.log("Min. Wert x:" + minX);
    console.log("Max. Wert x:" + maxX);
    console.log("Min. Wert y:" + minY);
    console.log("Max. Wert y:" + maxY);
    console.log("Min. Wert r:" + minR);
    console.log("Max. Wert r:" + maxR);

    // Farbscale für die Bubbles basierend auf den Spalte world_4region
    let colorInt = d3
      .scaleOrdinal()
      .domain(["asia", "europe", "africa", "americas"])
      .range([
        "#e74c3c",
        "#3498db",
        "#f39c12",
        "#1abc9c",
      ]);

    let svg = d3
      .select("svg")
      .attr("width", svgWidth + margin.left + margin.right)
      .attr("height", svgHeight + margin.top + margin.bottom + 20)
      .attr("class", "chart");

    // X-Skala basierend auf dem ermittelten minX und maxX Wert
    let scaleX = d3
      .scaleLinear()
      .domain([0, maxX])
      .range([0, svgWidth]);

    // Y-Skala basierend auf dem ermittelten minY und maxY Wert
    let scaleY = d3
      .scaleLinear()
      .domain([minY, maxY])
      .range([svgHeight, 0]);

    let scaleR = d3.scaleSqrt().domain([minR, maxR]).range([3, 55]);

    // Skalen zur SVG hinzufügen
    svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + (svgHeight + margin.top) + ")")
      .call(d3.axisBottom(scaleX));

    // X-Achsenbeschriftung
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", margin.left + svgWidth / 2)
      .attr("y", svgHeight + margin.top + margin.bottom + 10)
      .style("font-size", "14px")
      .text(xParam);

    svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(d3.axisLeft(scaleY));

    // Y-Achsenbeschriftung
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -(margin.top + svgHeight / 2))
      .attr("y", 20)
      .style("font-size", "14px")
      .text(yParam);

    var tooltip = d3.select("#visualisation-container")
      .append("div") // <-- ÄNDERUNG: div statt rect
      .attr("class", "tooltip") // Gib ihm eine Klasse zum Stylen
      .style("opacity", 0) // Starte unsichtbar
      .style("position", "absolute") // Wichtig, damit wir es frei positionieren können
      .style("background-color", "black")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("color", "white")
      .style("pointer-events", "none");

    let showTooltip = function (event, d) {
      tooltip.transition().duration(200);
      tooltip
        .style("opacity", 1)
        .html(`
        <div class="tooltip-country">${d["country"]}</div>
        <div class="tooltip-continent">Kontinent: ${d["world_4region"]}</div>
        <div class="tooltip-avg-income">Tägliches Einkommen: $${d["Average Daily Income"]}</div>
        <div class="tooltip-population">Bevölkerung: ${d["Population"]}</div>
        <div class="tooltip-fertility">Kinder pro Mutter: ${d["Babies per Woman"]}</div>
        `,)
        .style("left", event.pageX + 30 + "px")
        .style("top", event.pageY + 30 + "px");
    };

    let moveTooltip = function (event, d) {
      tooltip
        .style("left", event.pageX + 30 + "px")
        .style("top", event.pageY + 30 + "px");
    };

    let hideTooltip = function (d) {
      tooltip.transition().duration(200).style("opacity", 0);
    };

    // Bubbles für die Länder erstellen
    let chart = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .selectAll("dot")
      .data(dataset)
      .enter()
      .append("circle")
      .attr("class", "bubbles")
      .attr("cx", (d) => scaleX(parseFloat(d[xParam])))
      .attr("cy", (d) => scaleY(parseFloat(d[yParam])))
      .attr("r", (d) => scaleR(parsePopulation(d[rParam])))
      .style("fill", (d) => colorInt(d[colorParam]))
      .style("opacity", 0.7)
      .on("mouseover", showTooltip)
      .on("mousemove", moveTooltip)
      .on("mouseleave", hideTooltip);
  },
  function (reason) {
    d3.select("body").append("p").text("Could not load dataset");
    console.error(reason);
  },
);
