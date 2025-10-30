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
    // Farbscale für die Bubbles basierend auf den Spalte world_4region
    let colorInt = d3
      .scaleOrdinal()
      .domain(["asia", "europe", "africa", "americas"])
      .range(["#e74c3c", "#3498db", "#f39c12", "#1abc9c"]);

    let svg = d3
      .select("svg")
      .attr("width", svgWidth + margin.left + margin.right)
      .attr("height", svgHeight + margin.top + margin.bottom + 20)
      .attr("class", "chart");

    // X-Skala basierend auf dem ermittelten minX und maxX Wert
    let scaleX = d3.scaleLinear().domain([0, maxX]).range([0, svgWidth]);

    // Y-Skala basierend auf dem ermittelten minY und maxY Wert
    let scaleY = d3.scaleLinear().domain([minY, maxY]).range([svgHeight, 0]);

    let scaleR = d3.scaleSqrt().domain([minR, maxR]).range([3, 55]);

    // Skalen zur SVG hinzufügen
    svg
      .append("g")
      .attr(
        "transform",
        "translate(" + margin.left + "," + (svgHeight + margin.top) + ")",
      )
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

    var tooltip = d3
      .select("#visualisation-container")
      .append("div") // <-- ÄNDERUNG: div statt rect
      .attr("class", "tooltip") // Gib ihm eine Klasse zum Stylen
      .style("opacity", 0) // Starte unsichtbar
      .style("position", "absolute") // Wichtig, damit wir es frei positionieren können
      .style("background-color", "white")
      .style("border-radius", "10px")
      .style("padding", "10px")
      .style("color", "black")
      .style("pointer-events", "none");

    let showTooltip = function (event, d) {
      tooltip.transition().duration(200);
      tooltip
        .style("opacity", 1)
        .html(
          `
        <div class="tooltip-country">${d["country"]}</div>
        <div class="tooltip-continent">Kontinent: ${d["world_4region"]}</div>
        <div class="tooltip-avg-income">Tägliches Einkommen: $${d["Average Daily Income"]}</div>
        <div class="tooltip-population">Bevölkerung: ${d["Population"]}</div>
        <div class="tooltip-fertility">Kinder pro Mutter: ${d["Babies per Woman"]}</div>
        `,
        )
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

    /*
     * Konfigurationsmöglichkeiten ergänzen (Filter nach Kontinenten)
     */
    const continents = [
      { id: "asia", label: "Asien", value: "asia" },
      { id: "europe", label: "Europa", value: "europe" },
      { id: "americas", label: "Amerikas", value: "americas" },
      { id: "africa", label: "Afrika", value: "africa" },
    ];

    // Alle kontinente, die in der Visualisierung gezeigt werden sollen sammeln (Am Anfang alle Kontinente)
    let activeFilters = new Set(continents.map((c) => c.value));

    // Control Container erstellen
    const configControlContainer = d3
      .select("#config-controll-container")
      .append("div")
      .attr("class", "filter-container");

    // Checkboxen für jeden Kontinent erstellen
    continents.forEach((continent) => {
      const checkboxWrapper = configControlContainer
        .append("div")
        .attr("class", "checkbox-wrapper");

      checkboxWrapper
        .append("input")
        .attr("id", `${continent.id}-checkbox`)
        .attr("type", "checkbox")
        .attr("name", continent.id)
        .attr("value", continent.value)
        .style("margin-right", "5px")
        .style("height", "15px")
        .property("checked", true) // Anfangs alle aktiviert
        .on("change", function () {
          // Filter aktualisieren (Unterscheidung ob checkbox aktiviert oder dekativiert wurde)
          if (this.checked) {
            activeFilters.add(continent.value);
          } else {
            activeFilters.delete(continent.value);
          }
          updateChart();
        });

      checkboxWrapper
        .append("label")
        .attr("for", `${continent.id}-checkbox`)
        .text(continent.label);
    });

    // Funktion zum Aktualisieren des Charts
    function updateChart() {
      svg
        .selectAll(".bubbles")
        .transition()
        .duration(300)
        .style("opacity", (d) => {
          // Nur wenn der Kontinent im Filter enthalten ist, soll die Bubble sichtbar sein
          return activeFilters.has(d[colorParam]) ? 0.7 : 0;
        })
        .style("pointer-events", (d) => {
          // Pointer nur, wenn die jeweilige Bubble auch angezeigt wird
          return activeFilters.has(d[colorParam]) ? "all" : "none";
        });
    }
    /*
     * Legende füllen:
     *   - Min und Max Werte für die jeweiligen Felder einfügen, um eine bessere Übersicht über das Datenset geben zu können
     */
    if (minX != null && maxX != null) {
      const legendDiv = d3.select("#x-axis-content").append("div");

      legendDiv
        .append("p")
        .attr("class", "field-description")
        .text("Durchschnittl. tägl. Einkommen");

      legendDiv
        .append("p")
        .attr("class", "legend-min-value")
        .text(`Minimalwert: ${minX}`);

      legendDiv
        .append("p")
        .attr("class", "legend-max-value")
        .text(`Maximalwert: ${maxX}`);
    }

    if (minY != null && maxY != null) {
      const legendDiv = d3.select("#y-axis-content").append("div");

      legendDiv
        .append("p")
        .attr("class", "field-description")
        .text("Durchschnittl. Kinder pro Frau");

      legendDiv
        .append("p")
        .attr("class", "legend-min-value")
        .text(`Minimalwert: ${minY}`);

      legendDiv
        .append("p")
        .attr("class", "legend-max-value")
        .text(`Maximalwert: ${maxY}`);
    }

    if (minR != null && maxR != null) {
      const legendDiv = d3.select("#radius-content").append("div");

      legendDiv
        .append("p")
        .attr("class", "field-description")
        .text("Bevölkerung");

      legendDiv
        .append("p")
        .attr("class", "legend-min-value")
        .text(`Minimalwert: ${minR}`);

      legendDiv
        .append("p")
        .attr("class", "legend-max-value")
        .text(`Maximalwert: ${maxR}`);
    }
  },
  function (reason) {
    d3.select("body").append("p").text("Could not load dataset");
    console.error(reason);
  },
);
