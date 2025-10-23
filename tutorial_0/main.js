
d3.csv("ecoli.csv").then(function(dataset) {
    const barHeight = 10;
    const svgWidth = 800;
    const svgHeight = dataset.length * barHeight;
    const margin = {
        top: 20,
        right: 30,
        bottom: 30,
        left: 100
    };
    let svg = d3.select("svg")
        .attr("width", (svgWidth + margin.left + margin.right))
        .attr("height", (svgHeight + margin.top + margin.bottom))
        .attr("class", "chart");

    let param = "mcg";
    let minValue = d3.min(dataset, function(d) { return d[param]; });
    let maxValue = d3.max(dataset, d => d[param]);

    let scaleX = d3.scaleLinear()
        .domain([minValue, maxValue])
        .range([margin.left, svgWidth]);
    
    let scaleY = d3.scaleBand()
        .domain(dataset.map(d => d["name"]))
        .range([0, svgHeight]);

    svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + (svgHeight + margin.top) + ")")
        .call(d3.axisBottom(scaleX));

    let chart = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", "0")
        // d = data value, i = index
        .attr("y", function(d,i) {
            return i * barHeight;
        })
        .attr("height", barHeight)
        .attr("width", d => scaleX(d[param]))
        .attr("fill", "red")
        .show();
    
}, function(reason) {
    d3.select("body").append("p").text("Could not load dataset");
    console.error(reason);
})

 