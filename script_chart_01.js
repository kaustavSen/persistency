const drawChart = async () => {
  const colors = {
    greyLight: "#FBFBFB",
    greyMedium: "#BFBFBF",
    blueDark: "#00A0D2",
    yellowDark: "#FFB81C",
    purpleDark: "#702082"
  }
  
  let chartDimensions = {
    width: 550,
    height: 600,
    margin: {
      top: 30,
      right: 95,
      bottom: 50,
      left: 90
    }
  }
  chartDimensions.boundedWidth = chartDimensions.width 
    - chartDimensions.margin.left
    - chartDimensions.margin.right
  
  chartDimensions.boundedHeight = chartDimensions.height
    - chartDimensions.margin.top
    - chartDimensions.margin.bottom

  const data = await d3.csv("data.csv", d3.autoType)
  const dataGrouped = d3.group(data, d => d.short_name)

  const listedCompanies = ["SBI", "Max", "ICICI Pru", "HDFC"]
  const dataListed = data.filter(d => listedCompanies.includes(d.short_name))
  const dataListedGrouped = d3.group(dataListed, d => d.short_name)

  const dataPramerica = data.filter(d => d.short_name == "Pramerica")

  const xAccessor = d => d.year
  const yAccessor = d => d.rate
  
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, xAccessor))
    .range([0, chartDimensions.boundedWidth])

  const yScale = d3.scaleLinear()
    .domain([0.25, 1])
    .range([chartDimensions.boundedHeight, 0])

  const lineGenerator = d3.line()
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d)))

  const yAxisPadding = 55

  const yAxisGenerator = d3.axisLeft()
    .tickValues([0.25, 0.4, 0.55, 0.70, 0.85, 1])
    .tickFormat(yAxistickFormat)
    .tickSize(-chartDimensions.boundedWidth - yAxisPadding*1.1)
    .scale(yScale)

  const xAxisPadding = 10

  const xAxisGenerator = d3.axisBottom()
    .tickValues([2016, 2021])
    .tickFormat(d3.format(""))
    .scale(xScale)

  function yAxistickFormat(d) {
    const s = (d * 100).toFixed(0)
    return this.parentNode.nextSibling ? `${s}\xa0` : `${s}%`
  }

  const svg = d3.select(".chart")
    .append("svg")
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

  const yAxis = bounds.append("g")
      .attr("class", "y-axis")
      .style("transform", `translateX(-${yAxisPadding}px)`)
      .call(yAxisGenerator)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick text")
          .attr("dy", -5)
          .attr("x", yAxisPadding*0.3))
    
  const xAxis = bounds.append("g")
      .attr("class", "x-axis")
      .style("transform", `translateY(${chartDimensions.boundedHeight + xAxisPadding}px)`)
      .call(xAxisGenerator)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").remove())

  const linesInd = bounds
    .selectAll(".lines-ind")
    .data(dataGrouped)
    .join("path")
      .attr("class", "lines-ind")
      .attr("d", d => lineGenerator(d[1]))
      .attr("stroke", colors.greyMedium)
      .attr("fill", "none")
      .attr("stroke-width", 1.5)

  const linesListedOutlineGroup = bounds.append("g")
      .attr("class", "lines-listed-group")
        
  const linesListedOutline = linesListedOutlineGroup
    .selectAll(".lines-listed-outline")
    .data(dataListedGrouped)
    .join("path")
      .attr("class", "lines-listed-outline")
      .attr("d", d => lineGenerator(d[1]))
      .attr("stroke", "white")
      .attr("fill", "none")
      .attr("stroke-width", 7)
  
  const linesListed = linesListedOutlineGroup
      .selectAll(".lines-listed")
      .data(dataListedGrouped)
      .join("path")
        .attr("class", "lines-listed")
        .attr("d", d => lineGenerator(d[1]))
        .attr("stroke", colors.blueDark)
        .attr("fill", "none")
        .attr("stroke-width", 3.5)

  const linesPramericaGroup = bounds.append("g")
      .attr("class", "lines-pramerica-group")
  
  const linesPramericaOutline = linesPramericaGroup
    .append("path")
      .attr("class", "lines-pramerica-outline")
      .attr("d", d => lineGenerator(dataPramerica))
      .attr("stroke", "white")
      .attr("fill", "none")
      .attr("stroke-width", 7)
  
  const linesPramerica = linesPramericaGroup
    .append("path")
      .attr("class", "lines-pramerica")
      .attr("d", d => lineGenerator(dataPramerica))
      .attr("stroke", colors.yellowDark)
      .attr("fill", "none")
      .attr("stroke-width", 3.5)

  const listedLabels = linesListedOutlineGroup
    .selectAll(".listed-labels")
    .data(dataListed.filter(d => d.year == 2016))
    .join("text")
      .attr("class", "listed-labels")
      .attr("x", xScale(2016) - 10)
      .attr("y", d => yScale(d.rate))
      .text(d => d.short_name)

  const pramericaLabel = linesPramericaGroup
    .selectAll(".pramerica-label")
    .data(dataPramerica.filter(d => d.year == 2016))
    .join("text")
      .attr("class", "pramerica-label")
      .attr("x", xScale(2016) - 10)
      .attr("y", d => yScale(d.rate))
      .text(d => d.short_name)

  const labelsGroup = bounds.append("g")
      .attr("class", "labels-group")
        

  const labels = labelsGroup.selectAll(".name-label")
    .data(data.filter(d => d.year == 2021))
    .join("text")
      .attr("class", "name-label")
      .attr("x", xScale(2021))
      .attr("y", d => yScale(d.rate))
      .attr("dx", 8)
      .attr("dy", 4)
      .text(d => d.short_name)

  const labelsRate2021 = labelsGroup.selectAll(".label-rate-2021")
    .data(data.filter(d => d.year == 2021))
    .join("text")
      .attr("class", "label-rate-2021")
      .attr("x", xScale(2021))
      .attr("y", d => yScale(d.rate))
      .attr("dx", 8)
      .attr("dy", -10)
      .text(d => (d.rate * 100).toFixed(0))
  
  const labelsRate2016 = labelsGroup.selectAll(".label-rate-2016")
    .data(data.filter(d => d.year == 2016))
    .join("text")
      .attr("class", "label-rate-2016")
      .attr("x", xScale(2016))
      .attr("y", d => yScale(d.rate))
      .attr("dx", -12)
      .text(d => (d.rate * 100).toFixed(0))

  // adding interactions
  const transition = d => d3.transition().duration(300)

  svg
    .on("pointermove", moveEvent)
    .on("pointerleave", leaveEvent)

  const uniqueYears = [...new Set(data.map(d => d.year))]

  function moveEvent(event) {
    let [xm, ym] = d3.pointer(event)
    xm = xm - chartDimensions.margin.left
    ym = ym - chartDimensions.margin.top

    const calcDistance = d => Math.abs(xScale(d.year) - xm)
    const closestYear = uniqueYears[d3.scan(data, (a,b) => calcDistance(a) - calcDistance(b))]
    const closestPoint = d3.least(
      data.filter(d => d.year == closestYear), 
      d => Math.abs(yScale(d.rate) - ym)
    )
    
    linesInd
        .style("stroke", d => d[0] == closestPoint.short_name ? "#702082" : colors.greyMedium)
        .style("stroke-width", d => d[0] == closestPoint.short_name ? 3 : 1.5)
      .filter(d => d[0] == closestPoint.short_name)
      .raise()
    labels
        .style("opacity", d => d.short_name == closestPoint.short_name ? 1 : 0)
    labelsRate2021
        .style("opacity", d => d.short_name == closestPoint.short_name ? 1 : 0)
    labelsRate2016
        .style("opacity", d => d.short_name == closestPoint.short_name ? 1 : 0)
  }

  function leaveEvent() {
    linesInd
        .style("stroke", colors.greyMedium)
        .style("stroke-width", 1.5)
        .lower()
    labels
        .style("opacity", 0)
    labelsRate2021
        .style("opacity", 0)
    labelsRate2016
        .style("opacity", 0)
    
    d3.select(".lines-listed-group")
    .transition(transition())
      .style("opacity", 1)

    d3.select(".lines-pramerica-group")
      .transition(transition())
        .style("opacity", 1)
  }
  
  svg.on("pointerenter", function() {
    d3.select(".lines-listed-group")
      .transition(transition())
        .style("opacity", 0)

    d3.select(".lines-pramerica-group")
      .transition(transition())
        .style("opacity", 0)
  })

}
drawChart()