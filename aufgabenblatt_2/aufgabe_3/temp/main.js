// Farbgebung für Kontinente als Skala
const colorScheme = d3
  .scaleOrdinal()
  .domain([
    "Africa",
    "Americas",
    "Asia",
    "Europe",
    "East Asia & Pacific",
    "South Asia",
  ])
  .range(["#e74c3c", "#3498db", "#f39c12", "#2ecc71", "#9b59b6", "#1abc9c"]);

const margin = { top: 20, right: 20, bottom: 50, left: 70 };

// Umrechnung der Bevölkerungszahlen in verwendbare Werte
const parsePopulation = (str) => {
  if (!str) return NaN;
  const val = parseFloat(str);
  const s = str.toUpperCase();
  return s.includes("B")
    ? val * 1e9
    : s.includes("M")
      ? val * 1e6
      : s.includes("K")
        ? val * 1e3
        : val;
};

// Rekonvertierung für die Ausgabe
const formatPopulation = (n) =>
  n >= 1e9
    ? (n / 1e9).toFixed(2) + "B"
    : n >= 1e6
      ? (n / 1e6).toFixed(1) + "M"
      : n >= 1e3
        ? (n / 1e3).toFixed(1) + "K"
        : n.toFixed(0);

const getColor = (region) => colorScheme(region) || "#95a5a6";

// Tooltip-Funktionen
function showTooltip(event, d, tooltip) {
  tooltip
    .html(
      `
    <div class="tooltip-country">${d.country}</div>
    <div>Region: ${d.region}</div>
    <div>Daily Income: $${d.income.toFixed(2)}</div>
    <div>Population: ${formatPopulation(d.population)}</div>
    <div>Fertility: ${d.fertility.toFixed(2)}</div>
  `,
    )
    .classed("visible", true);
  moveTooltip(event, tooltip);
}

function moveTooltip(event, tooltip) {
  const { pageX, pageY } = event;
  tooltip.style("left", `${pageX + 10}px`).style("top", `${pageY}px`);
}

function hideTooltip(tooltip) {
  tooltip.classed("visible", false);
}

// Legende
function createLegend(svg, dataset, width) {
  const regions = Array.from(new Set(dataset.map((d) => d.region))).sort();
  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - 120}, 20)`);

  regions.forEach((region, i) => {
    const g = legend.append("g").attr("transform", `translate(0,${i * 20})`);
    g.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", getColor(region));
    g.append("text").attr("x", 18).attr("y", 10).text(region);
  });
}

// Erstellen der Visualisierung
d3.csv("gapminder.csv", (d) => ({
  country: d.country,
  income: +d["Average Daily Income"],
  fertility: +d["Babies per Woman"],
  population: parsePopulation(d.Population),
  region: d.world_4region || d.world_6region || "Unknown",
  incomeGroup: d.income_3groups ?? "",
}))
  .then((dataset) => {
    dataset = dataset.filter(
      (d) => !isNaN(d.income) && !isNaN(d.fertility) && !isNaN(d.population),
    );

    const container = d3.select("#chart");
    const { width: cw, height: ch } = container.node().getBoundingClientRect();
    const width = cw - margin.left - margin.right;
    const height = ch - margin.top - margin.bottom;

    const svg = container
      .append("svg")
      .attr("viewBox", [0, 0, cw, ch])
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Skalen
    const xScale = d3
      .scaleLog()
      .domain(d3.extent(dataset, (d) => d.income))
      .range([0, width])
      .nice();

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(dataset, (d) => d.fertility) * 1.1])
      .range([height, 0])
      .nice();

    // Skala für den Durchmesser
    const rScale = d3
      .scaleSqrt()
      .domain([0, d3.max(dataset, (d) => d.population)])
      .range([3, 50]);

    const xAxis = d3
      .axisBottom(xScale)
      .ticks(8, "~s")
      .tickFormat((d) => `$${d}`);
    const yAxis = d3.axisLeft(yScale);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .call((g) => g.select(".domain").remove());

    svg
      .append("g")
      .call(yAxis)
      .call((g) => g.select(".domain").remove());

    svg
      .append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""));

    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(""));

    // Tooltip
    const tooltip = d3.select(".tooltip");

    // Bubbles
    const bubbles = svg
      .selectAll(".bubble")
      .data(dataset, (d) => d.country)
      .join("circle")
      .attr("class", "bubble")
      .attr("cx", (d) => xScale(d.income))
      .attr("cy", (d) => yScale(d.fertility))
      .attr("r", (d) => rScale(d.population))
      .attr("fill", (d) => getColor(d.region))
      .attr("opacity", 0.8)
      .on("mouseenter", (event, d) => showTooltip(event, d, tooltip))
      .on("mousemove", (event) => moveTooltip(event, tooltip))
      .on("mouseleave", () => hideTooltip(tooltip));

    // Labels
    const labels = svg
      .selectAll(".label")
      .data(dataset)
      .join("text")
      .attr("class", "label")
      .attr("x", (d) => xScale(d.income))
      .attr("y", (d) => yScale(d.fertility))
      .attr("dy", "0.35em")
      .text((d) => d.country)
      .style("display", "none");

    // Legende
    createLegend(svg, dataset, width);

    // Label-Toggle
    d3.select("#showLabels").on("change", (e) =>
      labels.style("display", e.target.checked ? "block" : "none"),
    );
  })
  .catch((err) => console.error("Error loading data:", err));

