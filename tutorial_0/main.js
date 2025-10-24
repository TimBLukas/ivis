
d3.csv("ecoli.csv").then(function(dataset) {
    // Define size restrictions
    const barHeight = 10;
    const svgWidth = 800;
    const svgHeight = dataset.length * barHeight;
    const margin = {
        top: 20,
        right: 30,
        bottom: 30,
        left: 100
    };

    // potential features to be displayed (x-Values)
    const features = ["mcg", "gvh", "aac", "alm1", "alm2", "lip", "chg"];

    // select svg element (defined in index.html) and set size attributes
    let svg = d3.select("svg")
        .attr("width", (svgWidth + margin.left + margin.right))
        .attr("height", (svgHeight + margin.top + margin.bottom))
        .attr("class", "chart");

    // default param (unless changed by user)
    let param = "mcg";
    // min and max values of the dataset (for the default param)
    let minValue = d3.min(dataset, function(d) { return d[param]; });
    let maxValue = d3.max(dataset, d => d[param]);

    // color scale (low values: blue, mid values: white, high values: red)
    let colorInt = d3.scaleLinear()
        .domain([minValue, ((maxValue - minValue) / 2.0 + minValue), maxValue])
        .range(["blue", "white", "red"])
        .interpolate(d3.interpolateRgb);

    // scales for x (based on min and max values) and y (based on names) axis
    let scaleX = d3.scaleLinear()
        .domain([minValue, maxValue])
        .range([margin.left, svgWidth]);
    
    let scaleY = d3.scaleBand()
        .domain(dataset.map(d => d["name"]))
        .range([0, svgHeight]);

    svg.append("g")
        .attr("transform", "translate(0," + (svgHeight + margin.top) + ")")
        .call(d3.axisBottom(scaleX));
    
    svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.axisLeft(scaleY));


    // create bars
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
        // Use the scale to set the width according to the data value
        .attr("width", d => scaleX(d[param]))
        // use the color scale to set the fill color
        .attr("fill", d => colorInt(d[param]));
    
        // Create radio buttons for user input
        let form = d3.select("#valueSelection");

        form.append("p").text("Select the data Value for X-Axis:");

        let item = form.selectAll("label")
            .data(features)
            .enter()
            .append("label")
            .text(d => d)
            .append("input")
            .attr("type", "radio")
            .attr("name", "valueSel")
            .attr("class", "radioBtn")
            .attr("value", d => d);

        d3.selectAll("input").on("change", changeX);

        function changeX() {
            // get selected parameter
            let param = this.value;
            // update scales
            let minVal = d3.min(dataset, d => d[param]);
            let maxVal = d3.max(dataset, d => d[param]);
            let scaleX = d3.scaleLinear()
                .domain([minVal, maxVal])
                .range([0, svgWidth]);
            
            // add transition for bars
            let sel = d3.select("svg").transition().duration(750)
                .selectAll("rect")
                .attr("width", d => scaleX(d[param]));
        }
}, function(reason) {
    d3.select("body").append("p").text("Could not load dataset");
    console.error(reason);
})


 