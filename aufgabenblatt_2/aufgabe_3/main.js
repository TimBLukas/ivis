// Dimensionen definieren
var margin = {top: 10, right: 20, bottom: 30, left: 50},
    width = 500 - margin.left - margin.right,
    height = 420 - margin.top - margin.bottom;


// svg wählen und die Dimensionen festlegen
var svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// CSV-Daten einlesen (Promise-basiert und numerische Felder parsen)
d3.csv("gapminder.csv").then(function(data) {
    // parse numeric fields so scales work correctly
    data.forEach(function(d) {
        d["Avarage Daily Income"] = +d["Avarage Daily Income"];
        d["Babies per Woman"] = +d["Babies per Woman"];
        d["Population"] = +d["Population"];
        // ensure common keys exist (optional, depends on your CSV)
        d.country = d.country || d.Country;
        d["world_4region"] = d["world_4region"] || d.region || d.Region;
        d["main_religion_2008"] = d["main_religion_2008"] || d.main_religion_2008;
    });

    // define constants (now numeric)
    const minValueAvgIncome = d3.min(data, d => d["Avarage Daily Income"]);
    const maxValueAvgIncome = d3.max(data, d => d["Avarage Daily Income"]);

    const minValueBabiesPerWoman = d3.min(data, d => d["Babies per Woman"]);
    const maxValueBabiesPerWoman = d3.max(data, d => d["Babies per Woman"]);

    const minValuePopulation = d3.min(data, d => d["Population"]);
    const maxValuePopulation = d3.max(data, d => d["Population"]);


    // Add X axis (0 - maximal Wert der csv)
    var x = d3.scaleLinear()
        .domain([minValueAvgIncome, maxValueAvgIncome])
        .range([ 0, width ]);
    svg.append("g")
        .attr("transform", "translate(0," + width + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([minValueBabiesPerWoman, maxValueBabiesPerWoman])
        .range([ height, 0]);
    svg.append("g")
        .attr("transform", "translate(" + height + ", 0)")
        .call(d3.axisLeft(y));

    // Add a scale for bubble size
    var z = d3.scaleLinear()
        .domain([minValuePopulation, maxValuePopulation])
        .range([ 4, 40]);

    // Add a scale for bubble color
    var myColor = d3.scaleOrdinal()
        .domain(["asia", "europe", "americas", "africa", "oceania"])
        .range(d3.schemeSet2);

    // -1- Create a tooltip div that is hidden by default:
    var tooltip = d3.select("#data_visualisation")
        .append("div")
            .style("opacity", 0)
        .attr("class", "tooltip")
            .style("background-color", "black")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("color", "white")

    // -2- Create 3 functions to show / update / hide the tooltip
    var showTooltip = function(event, d) {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 1)
            .html(
                "Country: " + (d.country || "") + "<br/>" +
                "Daily Income: " + (d["Avarage Daily Income"] || "") + "<br/>" +
                "Population: " + (d["Population"] || "") + "<br/>" +
                "Babies Per Woman: " + (d["Babies per Woman"] || "") + "<br/>" +
                "Main Religion: " + (d["main_religion_2008"] || "")
            )
            .style("left", (d3.pointer(event)[0] + 30) + "px")
            .style("top", (d3.pointer(event)[1] + 30) + "px");
    }
    var moveTooltip = function(event, d) {
        tooltip
            .style("left", (d3.pointer(event)[0] + 30) + "px")
            .style("top", (d3.pointer(event)[1] + 30) + "px");
    }
    var hideTooltip = function() {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0);
    }

    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
            .attr("class", "bubbles")
            .attr("cx", d => x(d["Avarage Daily Income"]))
            .attr("cy", d => y(d["Babies per Woman"]))
            .attr("r", d => z(d["Population"]))
            .style("fill", d => myColor(d["world_4region"]))
        // Trigger the functions (D3 v6 style handlers pass event, d)
        .on("mouseover", showTooltip )
        .on("mousemove", moveTooltip )
        .on("mouseleave", hideTooltip );

}).catch(function(error){
    console.error("Error loading or parsing CSV:", error);
});