const drawChart2 = async () => {
  const colors = {
    greyLight: "#FBFBFB",
    greyMedium: "#BFBFBF",
    blueDark: "#00A0D2",
    yellowDark: "#FFB81C",
    purpleDark: "#702082"
  }
  
  let chartDimensions = {
    width: 900,
    height: 400,
    margin: {
      top: 20,
      right: 180,
      bottom: 40,
      left: 20
    }
  }
  chartDimensions.boundedWidth = chartDimensions.width 
    - chartDimensions.margin.left
    - chartDimensions.margin.right
  
  chartDimensions.boundedHeight = chartDimensions.height
    - chartDimensions.margin.top
    - chartDimensions.margin.bottom

  const numCharts = 3
  
  const xAccessor = d => d.year
  const yAccessor = d => d.pp_cum
    
  const data = await d3.csv("data_2.csv", d3.autoType)

  const dataGrouped = d3.group(data, d => d.short_name)
  const dataGroupedNew = d3.group(data, d => d.group, d => d.short_name)

  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, xAccessor))
    .range([0, chartDimensions.boundedWidth / numCharts - 20])

  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, yAccessor))
    .range([chartDimensions.boundedHeight / 1.1, 0])
    .nice()

  const colorScale = d3.scaleOrdinal()
    .domain([0, 1, 2])
    .range(["#00C389", "#00769D", "#C110A0"])

  const yAxisGenerator = d3.axisRight()
    .tickValues([-15, 0, 15, 30, 45])
    .tickSize(chartDimensions.boundedWidth / numCharts + 20)
    .scale(yScale)
    
  console.log(yAxisGenerator)

  const lineGenerator = d3.line()
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d)))
    .curve(d3.curveBumpX)

  const svg = d3.select(".chart2").append("svg")
      .attr("width", chartDimensions.width)
      .attr("height", chartDimensions.height)

  // add a background color to the plot
  svg.append("rect")
      .attr("width", chartDimensions.width)
      .attr("height", chartDimensions.height)
      .style("fill", colors.greyLight)

  const bounds = svg.append("g")
      .style("transform", `translate(
        ${chartDimensions.margin.left}px, 
        ${chartDimensions.margin.top}px
        )`)

  const singleChartWidth = chartDimensions.boundedWidth / numCharts
  
  const yOffset = new Map()
  yOffset.set(0, 60)
  yOffset.set(1, -90)
  yOffset.set(2, -200)

  const lineGroups = bounds.selectAll(".line-groups")
    .data(dataGroupedNew)
    .join("g")
      .attr("class", "line-groups")
      .style(
        "transform",
        (d, i) => `translate(
          ${singleChartWidth * i}px,
          ${yOffset.get(i)}px
        )`
      )

  bounds.select(".line-groups")
    .call(yAxisGenerator)
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line")
      .style("stroke", "#C8C6C6")
      .style("stroke-dasharray", "4,3"))

  let startColor = -1

  const lines = lineGroups.selectAll(".lines")
    .data(d => d[1])
    .join("path")
      .attr("class", "lines")
      .attr("d", d => lineGenerator(d[1]))
      .attr("fill", "none")
      .attr("stroke", (d, i) => i == 0 ? colorScale(startColor += 1) : colorScale(startColor))
      .attr("stroke-width", 3)
}
drawChart2()