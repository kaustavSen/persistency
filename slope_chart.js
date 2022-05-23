const drawChart = async () => {

    const colors = {
        greyLight: "#fbfbfbcc",
        greyMedium: "#BFBFBF",
        blueDark: "#00A0D2",
        yellowDark: "#FFB81C",
        purpleDark: "#702082"
      }
      
      let chartDimensions = {
        width: 560,
        height: 650,
        margin: {
          top: 30,
          right: 165,
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
    
      const dataFull = await d3.csv("data_slope_chart.csv", d3.autoType)
      let data = dataFull.filter(d => d.type == "month_13")
      let dataGrouped = d3.group(data, d => d.short_name_2)
    
      const xAccessor = d => d.year
      const yAccessor = d => d.rate
      
      const xScale = d3.scaleLinear()
        .domain(d3.extent(data, xAccessor))
        .range([0, chartDimensions.boundedWidth])
    
      const yScale = d3.scaleLinear()
        .domain([0.10, 1])
        .range([chartDimensions.boundedHeight, 0])
    
      const lineGenerator = d3.line()
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(yAccessor(d)))
    
      const yAxisPadding = 55
    
      const yAxisGenerator = d3.axisLeft()
        .tickValues([0.10, 0.25, 0.4, 0.55, 0.70, 0.85, 1])
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
    
      const svg = d3.select(".chart-holder")
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

      const linesIndGroup = bounds.append("g")
        .attr("class", "lines-ind-group")
    
      const linesInd = linesIndGroup
        .selectAll(".lines-ind")
        .data(dataGrouped, d => d[0])
        .join("path")
          .attr("class", d => `lines-ind ${d[0].replace(/\s+/g,"_")}`)
          .attr("d", d => lineGenerator(d[1]))
          .attr("stroke", colors.greyMedium)
          .attr("fill", "none")
          .attr("stroke-width", 1.5)

      const labelsGroupVisible = bounds.append("g")
          .attr("class", "labels-group-visible")

      function getLabelPosition(data) {
        let previousNY = 0
        let labelsData = data
          .filter(d => d.year == 2021)
          .sort((a, b) => d3.descending(a.rate, b.rate))
          .reduce((p, c) => {
            const ypx = yScale(c.rate)
            let ny

            if (ypx - previousNY < 15) {
              ny = previousNY + 15
            }

            p.push({
              short_name_2: c.short_name_2,
              labelPosition: ny || ypx
            })
            
            previousNY = ny || ypx

            return p.sort((a, b) => d3.ascending(a.short_name_2, b.short_name_2))
          }, [])

        return labelsData
      }
      
      const labelsVisible = labelsGroupVisible.selectAll(".name-label-visible")
        .data(getLabelPosition(data))
        .join("text")
        .attr("class", d => `name-label-visible ${d.short_name_2.replace(/\s+/g,"_")}`)
          .attr("x", xScale(2021))
          .attr("y", d => d.labelPosition)
          .attr("dx", 28)
          .attr("dy", 4)
          .text(d => d.short_name_2)
      
    
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
          .text(d => d.short_name_2)
    
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
      const transition = d => d3.transition().duration(800)

      let comp_name_1 = "None"
      let comp_name_2 = "None"
      let comp_name_3 = "None"
      let comp_name_4 = "None"
      let comp_name_5 = "None"
    
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

        labelsGroupVisible.style("opacity", 0)
        
        linesInd
            .attr("stroke", d => d[0] == closestPoint.short_name_2 ? "#702082" : colors.greyMedium)
            .attr("stroke-width", d => d[0] == closestPoint.short_name_2 ? 3 : 1.5)
            .classed("highlight-line-1", false)
            .classed("highlight-line-2", false)
            .classed("highlight-line-3", false)
            .classed("highlight-line-4", false)
            .classed("highlight-line-5", false)
          .filter(d => d[0] == closestPoint.short_name_2)
          .raise()
        labels
            .style("opacity", d => d.short_name_2 == closestPoint.short_name_2 ? 1 : 0)
        labelsRate2021
            .style("opacity", d => d.short_name_2 == closestPoint.short_name_2 ? 1 : 0)
        labelsRate2016
            .style("opacity", d => d.short_name_2 == closestPoint.short_name_2 ? 1 : 0)
      }
    
      function leaveEvent() {
        linesInd
            .attr("stroke", colors.greyMedium)
            .attr("stroke-width", 1.5)
            .lower()
        labels
            .style("opacity", 0)
        labelsRate2021
            .style("opacity", 0)
        labelsRate2016
            .style("opacity", 0)

        labelsGroupVisible.style("opacity", 1)

        if (comp_name_1 != "None") {
            bounds.select(`.${comp_name_1}`)
                .classed("highlight-line-1", true)
                .raise()
        }
        
        if (comp_name_2 != "None") {
            bounds.select(`.${comp_name_2}`)
                .classed("highlight-line-2", true)
                .raise()
        }
        
        if (comp_name_3 != "None") {
            bounds.select(`.${comp_name_3}`)
                .classed("highlight-line-3", true)
                .raise()
        }
        
        if (comp_name_4 != "None") {
            bounds.select(`.${comp_name_4}`)
                .classed("highlight-line-4", true)
                .raise()
        }
        
        if (comp_name_5 != "None") {
            bounds.select(`.${comp_name_5}`)
                .classed("highlight-line-5", true)
                .raise()
        }
        bounds.selectAll(".highlight")
            .raise()
      }
    
    const radioToolbar = d3.select("#radio-toolbar")
        .selectAll("input")
        .on("change", changePersistencyMonth)

    function changePersistencyMonth(event) {
      const month = `month_${event.target.value}`

      data = dataFull.filter(d => d.type == month)
      dataGrouped = d3.group(data, d => d.short_name_2)

      linesIndGroup
        .selectAll(".lines-ind")
        .data(dataGrouped, d => d[0])
          .attr("class", d => `lines-ind ${d[0].replace(/\s+/g,"_")}`)
          .classed("highlight-line-1", d => d[0].replace(/\s+/g,"_") ==  comp_name_1)
          .classed("highlight-line-2", d => d[0].replace(/\s+/g,"_") ==  comp_name_2)
          .classed("highlight-line-3", d => d[0].replace(/\s+/g,"_") ==  comp_name_3)
          .classed("highlight-line-4", d => d[0].replace(/\s+/g,"_") ==  comp_name_4)
          .classed("highlight-line-5", d => d[0].replace(/\s+/g,"_") ==  comp_name_5)
          .transition(transition())
          .delay((d, i) => i * 20)
          .attr("d", d => lineGenerator(d[1]))

      labelsGroup
        .selectAll(".name-label")
        .data(data.filter(d => d.year == 2021))
        .transition(transition())
        .delay((d, i) => i * 20)
          .attr("y", d => yScale(d.rate))
          .text(d => d.short_name_2)

      labelsGroup.selectAll(".label-rate-2021")
        .data(data.filter(d => d.year == 2021))
          .attr("y", d => yScale(d.rate))
          .text(d => (d.rate * 100).toFixed(0))

      labelsGroup.selectAll(".label-rate-2016")
        .data(data.filter(d => d.year == 2016))
          .attr("y", d => yScale(d.rate))
          .text(d => (d.rate * 100).toFixed(0))
      
        labelsGroupVisible
          .selectAll(".name-label-visible")
          .data(getLabelPosition(data))
            .attr("class", d => `name-label-visible ${d.short_name_2.replace(/\s+/g,"_")}`)
            .classed("highlight-comp-1", d => d.short_name_2.replace(/\s+/g,"_") ==  comp_name_1)
            .classed("highlight-comp-2", d => d.short_name_2.replace(/\s+/g,"_") ==  comp_name_2)
            .classed("highlight-comp-3", d => d.short_name_2.replace(/\s+/g,"_") ==  comp_name_3)
            .classed("highlight-comp-4", d => d.short_name_2.replace(/\s+/g,"_") ==  comp_name_4)
            .classed("highlight-comp-5", d => d.short_name_2.replace(/\s+/g,"_") ==  comp_name_5)
          .transition(transition())
          .delay((d, i) => i * 20)
            .attr("y", d => d.labelPosition)
    }

    const compHighlight1 = d3.select("#comp1-select")
        .on("change", changeHighlight1)

    function changeHighlight1(event) {
        comp_name_1 = this.value.replace(/\s+/g,"_")

        linesIndGroup.select(".highlight-line-1")
            .classed("highlight-line-1", false)
            .classed("highlight", false)

        labelsGroupVisible.select(".highlight-comp-1")
          .classed("highlight-comp-1", false)

        if (comp_name_1 == "None") {
          linesIndGroup
                .selectAll(".highlight")
                .raise()
        } else {
          linesIndGroup
              .select(`.${comp_name_1}`)
              .classed("highlight-line-1", true)
              .classed("highlight", true)

            linesIndGroup
              .selectAll(".highlight")
              .raise()

            labelsGroupVisible.select(`.${comp_name_1}`)
              .classed("highlight-comp-1", true)
        }
    }

    const compHighlight2 = d3.select("#comp2-select")
        .on("change", changeHighlight2)

    function changeHighlight2(event) {
        comp_name_2 = this.value.replace(/\s+/g,"_")

        linesIndGroup.select(".highlight-line-2")
            .classed("highlight-line-2", false)
            .classed("highlight", false)

        labelsGroupVisible.select(".highlight-comp-2")
          .classed("highlight-comp-2", false)

        if (comp_name_2 == "None") {
          linesIndGroup
                .selectAll(".highlight")
                .raise()
            return; // reset and do nothing 
        } else {
          linesIndGroup
              .select(`.${comp_name_2}`)
              .classed("highlight-line-2", true)
              .classed("highlight", true)
               
            linesIndGroup
                .selectAll(".highlight")
                .raise()

            labelsGroupVisible.select(`.${comp_name_2}`)
              .classed("highlight-comp-2", true)
        }
    }
    
    const compHighlight3 = d3.select("#comp3-select")
        .on("change", changeHighlight3)

    function changeHighlight3(event) {
        comp_name_3 = this.value.replace(/\s+/g,"_")

        linesIndGroup.select(".highlight-line-3")
            .classed("highlight-line-3", false)
            .classed("highlight", false)

        labelsGroupVisible.select(".highlight-comp-3")
          .classed("highlight-comp-3", false)

        if (comp_name_3 == "None") {
          linesIndGroup
                .selectAll(".highlight")
                .raise()
            return; // reset and do nothing 
        } else {
            linesIndGroup
              .select(`.${comp_name_3}`)
              .classed("highlight-line-3", true)
              .classed("highlight", true)
               
            linesIndGroup
                .selectAll(".highlight")
                .raise()
            
            labelsGroupVisible.select(`.${comp_name_3}`)
              .classed("highlight-comp-3", true)
        }
    }
    
    const compHighlight4 = d3.select("#comp4-select")
        .on("change", changeHighlight4)

    function changeHighlight4(event) {
        comp_name_4 = this.value.replace(/\s+/g,"_")

        linesIndGroup.select(".highlight-line-4")
            .classed("highlight-line-4", false)
            .classed("highlight", false)

        labelsGroupVisible.select(".highlight-comp-4")
          .classed("highlight-comp-4", false)

        if (comp_name_4 == "None") {
          linesIndGroup
                .selectAll(".highlight")
                .raise()
            return; // reset and do nothing 
        } else {
          linesIndGroup
              .select(`.${comp_name_4}`)
              .classed("highlight-line-4", true)
              .classed("highlight", true)
               
              linesIndGroup
                .selectAll(".highlight")
                .raise()
            
            labelsGroupVisible.select(`.${comp_name_4}`)
              .classed("highlight-comp-4", true)
        }
    }
    
    const compHighlight5 = d3.select("#comp5-select")
        .on("change", changeHighlight5)

    function changeHighlight5(event) {
        comp_name_5 = this.value.replace(/\s+/g,"_")

        linesIndGroup.select(".highlight-line-5")
            .classed("highlight-line-5", false)
            .classed("highlight", false)

        labelsGroupVisible.select(".highlight-comp-5")
          .classed("highlight-comp-5", false)

        if (comp_name_5 == "None") {
          linesIndGroup
                .selectAll(".highlight")
                .raise()
            return; // reset and do nothing 
        } else {
          linesIndGroup
              .select(`.${comp_name_5}`)
              .classed("highlight-line-5", true)
              .classed("highlight", true)
               
            linesIndGroup
                .selectAll(".highlight")
                .raise()

            labelsGroupVisible.select(`.${comp_name_5}`)
              .classed("highlight-comp-5", true)
        }
    }
}

drawChart();