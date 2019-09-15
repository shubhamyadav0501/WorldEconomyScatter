d3.csv("./data/PreppedDataCombined.csv")
  .then(
    initializeScatterChart
    /*function(data){
      console.log(data);
    }*/
  )

  function initializeScatterChart(data){
    //console.log(data);
    // Define width & height for the svg container.
      var width = 1000;
      var height = 700;
      var labelOffset = 20;
      var markerOffset = 220;
    // Define margins for the visualization.
      var margin = {
                      left : 100,
                      right : 20,
                      top : 40,
                      bottom : 100,
                   }
    // Main Container
    var mainDiv = d3.select("#App")
                    .style("width","100%")
                    .style("position","relative")
                    .style("margin", "auto")

    // Year Container
    var yearDiv = d3.select("#yearDiv")
                  .style("width", "15%")
                  .style("height", "250px")
                  .style("vertical-align","top")
                  .style("display","inline-block")
                  .style("border", "solid black 1px")
                  .style("border-radius", "1em")
                  .style("margin-left","10px")
                  .style("margin-top", "10px")
                  .style("text-align", "center")

    // Chart Container
    var chartDiv = d3.select("#chartDiv")
                      .style("width", "75%")
                      .style("display","inline-block")
                      .style("border", "solid black 1px")
                      .style("border-radius", "1em")
                      .style("margin-left","20px")
                      .style("margin-top", "10px")

    // SVG Container
    var svg = d3.select("#chartDiv")
               .append("svg")
               .attr("id","canvas")
               .attr("width",width)
               .attr("height",height)
               .style("margin-left","20px")

    // Unique list of Years in the data
    var yearList = d3.set(data.map((d) => {
                    return d["Year"]
                  })).values()
    //console.log(yearList);

    // Unique list of Years in the data
    var countryList = d3.set(data.map((d) => {
                    return d["CountryName"]
                  })).values()
    //console.log(countryList);

    // Country circles for animation
    var circleGroup = svg.append("g")

    var countryGroup = circleGroup.selectAll("circle")
                                 .data(countryList)
                                 .enter()
                                 .append("circle")

    // Creating the x-axis
    svg.append('g')
        .attr("id","xAxis")
        .attr("transform","translate(0,"+ (height-margin.bottom) +")")
        //.call(d3.axisBottom(xAxisScale))

    // y-Axis
    svg.append('g')
        .attr("id","yAxis")
        .attr("transform","translate("+ margin.left +",0)")
        //.call(d3.axisLeft(yAxisScale))

    // Div for tooltip
    var tooltip = d3.select("#App").append("div")
                      .attr("class", "tooltip")
                      .style("opacity", 0);

//==============================================================================
  // To get chart for selected year
  function customChart(customYear){

      d3.select("#year").transition().text(customYear)

      // Filtering data for the specific year
      var filteredDataByYear = data.filter((d) => {
                          return d["Year"] == customYear
                        })
      //console.log(filteredDataByYear);

      // Cleansing data by removing null values
      var filteredData = filteredDataByYear.filter((d) => {
                          return (d.Population != "" && d.GDP != "" && d.CountryName != "World" && d.CountryName != "South Asia")
                        })
      //console.log(filteredData);

      // Find out max values for Population and GDP for current Year
      var maxPopulation = d3.max(filteredData.map((d) => {
                            return +d.Population
                          }))
      var maxGdp = d3.max(filteredData.map((d) => {
                            return +d.GDP
                          }))
      //console.log(maxPopulation,maxGdp);

      // Grouping data based on Country
      var nestedData = d3.nest()
                        .key((d) => {
                          return d.CountryName;
                        })
                        .entries(filteredData)
      //console.log(nestedData);

      // Converting data to a more convenient format
      var formattedData = nestedData.map((d) => {
        return {
          "countryName" : d.key,
          "population" : +d.values[0].Population/1000000,
          "gdp" : +d.values[0].GDP/1000000000,
          "size" : +d.values[0].GDP/+d.values[0].Population,
          "section" : (+d.values[0].GDP/+d.values[0].Population) > 20000 ? "Developed" : (+d.values[0].GDP/+d.values[0].Population) > 1000 ? "Developing" : "Under Developed"
        }
      })
      //console.log(formattedData);

      // Defining the scales for the axis and bubble size
      var xAxisScale = d3.scaleLinear()
          .domain([0,1.1*d3.max(formattedData.map((d)=>{
              return d.population
          }))])
          .range([margin.left,width-margin.right])

      var yAxisScale = d3.scaleLinear()
          .domain([0,1.1*d3.max(formattedData.map((d)=>{
              return d.gdp
          }))])
          .range([height-margin.bottom,margin.top])

       var size = d3.scaleLinear()
                    .domain(d3.extent(formattedData.map((d)=>{
                        return d.size
                    })))
                   .range([5,15])

      // Creating the x-axis
      d3.select("#xAxis")
        .call(d3.axisBottom(xAxisScale))
        .transition()
        .duration(1500)
         //.delay(1000)

      // y-Axis
      d3.select("#yAxis")
        .call(d3.axisLeft(yAxisScale))
        .transition()
        .duration(1500)
        //.delay(1000)

      // tooltip mouseover event handler
      var tipMouseover = function(d) {
        //var color = colorScale(d.countryName);
          var html  = "<b> Country: </b>" + d.countryName + "<br/>" +
                      "<b> Population: </b>" + d.population.toFixed(2) + " Million<br/>" +
                      "<b> GDP: </b>" + d.gdp.toFixed(2) + " Billion USD<br/>" +
                      "<b> GDP per Capita: </b>" + d.size.toFixed(2) + " USD<br/>";

          tooltip.html(html)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
            .transition()
              .duration(100)
              .style("opacity", .9)

      };
      // tooltip mouseout event handler
      var tipMouseout = function(d) {
          tooltip.transition()
              .duration(300)
              .style("opacity", 0);
      };


      // bubbles for the scatter
      //var circleGroup = svg.append("g")
      countryGroup.data(formattedData)
      countryGroup.enter()
                  .append("circle")
      countryGroup.transition()
                  .duration(1500)
                  //.delay(1000)
                  .attr("cx", (d)=>{
                    return xAxisScale(d.population)
                  })
                  .attr("cy", (d)=>{
                    return yAxisScale(d.gdp)
                  })
                  .attr("r", (d)=>{
                    //console.log(customformattedData,d,d.size);
                    return size(d.size)
                  })
                  .attr("fill", (d) => { return d.size > 20000? "#4DB770" : d.size > 1000 ? "#FFD084" : "#F0540E"})
                  .attr("stroke", "black")
                  .attr("stroke-width","0.75px")
      countryGroup.on("mouseover", tipMouseover)
      countryGroup.on("mouseout", tipMouseout)
    }

//==============================================================================
    // Function to run for each year.
    function yearlyData(){
      if(counter <= yearList.length){
       counter += 1
       var currentYear = yearList[counter]
       d3.select("#year").transition().text(currentYear)
       //console.log(currentYear);

      // Filtering data for the specific year
      var filteredDataByYear = data.filter((d) => {
                          return d["Year"] == currentYear
                        })
      //console.log(filteredDataByYear);

      // Cleansing data by removing null values
      var filteredData = filteredDataByYear.filter((d) => {
                          return (d.Population != "" && d.GDP != "" && d.CountryName != "World" && d.CountryName != "South Asia")
                        })
      //console.log(filteredData);

      // Find out max values for Population and GDP for current Year
      var maxPopulation = d3.max(filteredData.map((d) => {
                            return +d.Population
                          }))
      var maxGdp = d3.max(filteredData.map((d) => {
                            return +d.GDP
                          }))
      console.log(maxPopulation,maxGdp);

      // Grouping data based on Country
      var nestedData = d3.nest()
                        .key((d) => {
                          return d.CountryName;
                        })
                        .entries(filteredData)
      //console.log(nestedData);

      // Converting data to a more convenient format
      var formattedData = nestedData.map((d) => {
        return {
          "countryName" : d.key,
          "population" : +d.values[0].Population/1000000,
          "gdp" : +d.values[0].GDP/1000000000,
          "size" : +d.values[0].GDP/+d.values[0].Population,
          "section" : (+d.values[0].GDP/+d.values[0].Population) > 20000 ? "Developed" : (+d.values[0].GDP/+d.values[0].Population) > 1000 ? "Developing" : "Under Developed"
        }
      })
      //console.log(formattedData);

      // Defining the scales for the axis and bubble size
      var xAxisScale = d3.scaleLinear()
          .domain([0,1.1*d3.max(formattedData.map((d)=>{
              return d.population
          }))])
          .range([margin.left,width-margin.right])

      var yAxisScale = d3.scaleLinear()
          .domain([0,1.1*d3.max(formattedData.map((d)=>{
              return d.gdp
          }))])
          .range([height-margin.bottom,margin.top])

       var size = d3.scaleLinear()
                    .domain(d3.extent(formattedData.map((d)=>{
                        return d.size
                    })))
                   .range([5,15])

      // Creating the x-axis
      // svg.append('g')
      //    .attr("transform","translate(0,"+ (height-margin.bottom) +")")
      d3.select("#xAxis")
        .call(d3.axisBottom(xAxisScale))
        .transition()
        .duration(1500)
         //.delay(1000)

      // y-Axis
      // svg.append('g')
      //   .attr("transform","translate("+ margin.left +",0)")
      d3.select("#yAxis")
        .call(d3.axisLeft(yAxisScale))
        .transition()
        .duration(1500)
        //.delay(1000)

      // tooltip mouseover event handler
      var tipMouseover = function(d) {
        //var color = colorScale(d.countryName);
          var html  = "<b> Country: </b>" + d.countryName + "<br/>" +
                      "<b> Population: </b>" + d.population.toFixed(2) + " Million<br/>" +
                      "<b> GDP: </b>" + d.gdp.toFixed(2) + " Billion USD<br/>" +
                      "<b> GDP per Capita: </b>" + d.size.toFixed(2) + " USD<br/>";

          tooltip.html(html)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
            .transition()
              .duration(100)
              .style("opacity", .9)

      };
      // tooltip mouseout event handler
      var tipMouseout = function(d) {
          tooltip.transition()
              .duration(300)
              .style("opacity", 0);
      };


      // bubbles for the scatter
      //var circleGroup = svg.append("g")
      countryGroup.data(formattedData)
      countryGroup.enter()
                  .append("circle")
      countryGroup.transition()
                  .duration(1500)
                  //.delay(1000)
                  .attr("cx", (d)=>{
                    return xAxisScale(d.population)
                  })
                  .attr("cy", (d)=>{
                    return yAxisScale(d.gdp)
                  })
                  .attr("r", (d)=>{
                    return size(d.size)
                  })
                  .attr("fill", (d) => { return d.size > 20000? "#4DB770" : d.size > 1000 ? "#FFD084" : "#F0540E"})
                  .attr("stroke", "black")
                  .attr("stroke-width","0.75px")
      countryGroup.on("mouseover", tipMouseover)
      countryGroup.on("mouseout", tipMouseout)
  }
  else{
    setTimeout("location.reload(true);",50)
  }
}
      // Chart Title
      svg.append("text")
          .attr("x",width/2+margin.left/2)
          .attr("y",margin.top - 10)
          .attr("text-anchor","middle")
          .attr("font-size", "20px")
          .attr("font-weight", "bold")
          .text("The World Economy Over the Years")

      // x-axis label
      svg.append("text")
          .attr("x",width/2+margin.left/2)
          .attr("y",height - margin.bottom/2 - 10)
          .attr("text-anchor","middle")
          .attr("font-weight", "bold")
          .text("Population (In Millions)")

      // y-axis label
      svg.append("text")
          .attr("x",margin.left - margin.left/2)
          .attr("y",height/2)
          .attr("transform", "rotate(-90,"+ (margin.left - margin.left/2 - 10) +","+ (height/2) +")" )
          .attr("text-anchor","middle")
          .attr("font-weight", "bold")
          .text("GDP (In Billion Dollars)")

      // Creating Legend
      var legendItems = [{key: "Developed Countries", color:"#4DB770"},
                        {key: "Developing Countries", color: "#FFD084"},
                        {key: "Under Developed Countries", color: "#F0540E"}]
      //console.log(legendItems);

      var legend = svg.selectAll(".legend")
        .data(legendItems)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => { return "translate(" + i * markerOffset + ","+ (height-25) +")"; });

      legend.append("circle")
        .style("fill",(d) => {return d.color})
        	.attr("cx", margin.left)
          .attr("cy", 0)
          .attr("r", 12)

      legend.append("text")
          .attr("x", margin.left + labelOffset)
          .attr("y", 0)
          .attr("dy", ".35em")
          .style("text-anchor", "start")
          .style("font-size", "16px")
          .text((d) => {return d.key});

    var counter = 0
    //yearlyData()
    d3.select("#canvas").on('load', function(){
      customChart(1960)
    })
    d3.select("#runbtn").on('click', function(){
      var t = setInterval(yearlyData,2000)
    })
    d3.select("#showbtn").on('click', function(){
      //clearInterval(t);
      var customYear = document.getElementById("customYear").value
      //console.log(customYear);
      customChart(customYear)
    })
}
