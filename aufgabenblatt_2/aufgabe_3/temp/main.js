const MARGIN = { top: 40, right: 120, bottom: 60, left: 80 }; 
const SVG_WIDTH = 900;  
const SVG_HEIGHT = 600; 
const WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
const HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;
const CSV_FILE = "gapminder.csv"; 
const X_AXIS_LABEL = "Average Daily Income";
const Y_AXIS_LABEL = "Babies per Woman";

const REGION_COLORS = d3.scaleOrdinal(d3.schemeSet2); 

const svg = d3.select("#data_visualisation") 
    .append("svg") 
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT);

const g = svg.append("g") 
    .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

const tooltip = d3.select("#data_visualisation") 
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0); 

function parsePopulation(populationString) {
    if (!populationString) return 0; 
    
    let cleanedString = populationString.trim().replace(/,/g, '');

    const lastChar = cleanedString[cleanedString.length - 1];
    let value = parseFloat(cleanedString); 

    if (isNaN(value)) return 0; 

    if (lastChar === 'M') {
        value *= 1000000;
    } else if (lastChar === 'k') {
        value *= 1000;
    } else if (lastChar === 'B') {
        value *= 1000000000;
    }

    return value;
}


d3.csv(CSV_FILE)
    .then(data => {
        data.forEach(d => {
            d.avgDailyIncome = +String(d["Average Daily Income"]).replace(',', '.') || 0; 
            d.babiesPerWoman = +String(d["Babies per Woman"]).replace(',', '.') || 0;
            
            d.population = parsePopulation(d["Population"]); 
            
            d.country = d.country || d.Country || "Unknown Country";
            d.region = d["world_4region"] || d.region || d.Region || "Unknown Region";
            d.mainReligion = d["main_religion_2008"] || "Unknown Religion"; 
        });

        const filteredData = data.filter(d => 
            d.avgDailyIncome > 0 && d.babiesPerWoman > 0 && d.population > 0
        );
        
        if (filteredData.length === 0) {
            console.error("Keine gültigen Daten zum Anzeigen des Diagramms gefunden nach Filterung."); 
            g.append("text")
                .attr("x", WIDTH / 2)
                .attr("y", HEIGHT / 2)
                .attr("text-anchor", "middle")
                .attr("class", "error-message") 
                .text("Keine Daten verfügbar oder alle Daten ungültig. Bitte CSV-Header & Datenformat prüfen."); 
            return; 
        }

        const maxAvgIncome = d3.max(filteredData, d => d.avgDailyIncome);
        const maxBabiesPerWoman = d3.max(filteredData, d => d.babiesPerWoman);
        const maxPopulation = d3.max(filteredData, d => d.population);

        const xScale = d3.scaleLinear()
            .domain([0, maxAvgIncome * 1.05]) 
            .range([0, WIDTH]);

        const yScale = d3.scaleLinear()
            .domain([0, maxBabiesPerWoman * 1.1])
            .range([HEIGHT, 0]); 

        const radiusScale = d3.scaleLinear()
            .domain([0, maxPopulation])
            .range([4, 40]); 

        REGION_COLORS.domain([...new Set(filteredData.map(d => d.region))]);

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        g.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", `translate(0,${HEIGHT})`)
            .call(xAxis)
            .append("text") 
            .attr("x", WIDTH / 2)
            .attr("y", MARGIN.bottom - 10) 
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .attr("class", "axis-label")
            .text(X_AXIS_LABEL);

        g.append("g")
            .attr("class", "y-axis axis")
            .call(yAxis)
            .append("text") 
            .attr("transform", "rotate(-90)")
            .attr("y", -MARGIN.left + 20) 
            .attr("x", -HEIGHT / 2)
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .attr("class", "axis-label")
            .text(Y_AXIS_LABEL);

        const showTooltip = function(event, d) {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 1);
            updateTooltip(event, d); 
        };

        const updateTooltip = function(event, d) {
            tooltip
                .html(
                    `Country: <b>${d.country}</b><br/>` +
                    `Daily Income: <b>$${d.avgDailyIncome.toFixed(2)}</b><br/>` + 
                    `Population: <b>${d.population.toLocaleString()}</b><br/>` + 
                    `Babies Per Woman: <b>${d.babiesPerWoman.toFixed(2)}</b><br/>` +
                    `Main Religion: <b>${d.mainReligion}</b>`
                )
                .style("left", `${event.pageX + 15}px`) 
                .style("top", `${event.pageY - 28}px`); 
        };

        const hideTooltip = function() {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0);
        };

        g.append('g')
            .attr("class", "bubble-group")
            .selectAll(".bubble") 
            .data(filteredData) 
            .join("circle") 
            .attr("class", "bubble")
            .attr("cx", d => xScale(d.avgDailyIncome))
            .attr("cy", d => yScale(d.babiesPerWoman))
            .attr("r", d => radiusScale(d.population))
            .style("fill", d => REGION_COLORS(d.region))
            .style("opacity", 0.7)
            .on("mouseover", showTooltip)
            .on("mousemove", updateTooltip)
            .on("mouseleave", hideTooltip);

        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${SVG_WIDTH - MARGIN.right + 20}, ${MARGIN.top})`); 

        const regions = REGION_COLORS.domain();

        legend.selectAll(".legend-item")
            .data(regions)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`)
            .each(function(d) {
                d3.select(this).append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", 15)
                    .attr("height", 15)
                    .style("fill", REGION_COLORS(d));
                d3.select(this).append("text")
                    .attr("x", 20)
                    .attr("y", 12)
                    .text(d)
                    .style("font-size", "12px")
                    .attr("alignment-baseline", "middle");
            });

    })
    .catch(error => {
        console.error("Fehler beim Laden oder Parsen der CSV-Datei:", error);
        d3.select("#data_visualisation").append("p")
            .attr("class", "error-message")
            .text("Fehler beim Laden der Daten. Bitte prüfen Sie die Konsolenausgabe.");
    });