const animals = ["horse", "cow", "pig", "dog", "cat", "rabbit"];

const SAMPLEDATA = [
  { id: "d1", value: 10, region: "USA" },
  { id: "d2", value: 20, region: "DE" },
  { id: "d3", value: 10, region: "UK" },
  { id: "d4", value: 50, region: "DE" },
  { id: "d5", value: 30, region: "USA" },
  { id: "d6", value: 70, region: "FR" },
  { id: "d7", value: 45, region: "GR" },
];

// Setting up a scaling function
const xScale = d3.scaleBand()
  .domain(SAMPLEDATA.map((data) => data.region))
  .rangeRound([0, 500])
  .padding(0.2);

const yScale = d3.scaleLinear()
  .domain([0, 100])
  .range([400, 0]);

// Generate basic paragraphs based on sample Data (Dom Modification)
// d3.select("div")
//   .selectAll("p")
//   .data(animals)
//   .enter()
//   .append("p")
//   .text((animal) => animal);
//
//

// Create a simple bar chart (change svg tag to div)
// const container = d3
//   .select('div')
//   .classed('container', true)
//   .style('border', '1px solid red');
// 
// const bars = container
//   .selectAll('bar')
//   .data(SAMPLEDATA)
//   .enter()
//   .append('div')
//   .classed('bar', true)
//   .style('width', '50px')
//   .style('height', (d) => 3 * d.value + 'px')
//   .text((d) => d.region);

// Create more advanced charts using svgs
const container = d3.select('svg')
  .classed('container', true);


const bars = container
  .selectAll('.svg-bar')
  .data(SAMPLEDATA)
  .enter()
  .append('rect')
  .classed('svg-bar', true)
  .attr('width', xScale.bandwidth())
  .attr('height', (data) => 400 - yScale(data.value))
  .attr('x', (data) => xScale(data.region))
  .attr('y', (data) => yScale(data.value));


setTimeout(() => {
  bars.data(SAMPLEDATA.slice(0, 4))
    .exit()
    .remove();
}, 2000)
