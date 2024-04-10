class BarChart2 {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 400,
            containerHeight: _config.containerHeight || 400,
            margin: _config.margin || {top: 30, right: 20, bottom: 20, left: 30}
        };
        this.data = _data;

        this.initVis();
    }
    
    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
        
        vis.svg = d3.select(vis.config.parentElement)
            .append('svg')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);        
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
        
        vis.colorScale = d3.scaleOrdinal()
            .range(['#FFA500','#0000FF'])

        vis.xScale = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.2);
        
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]); 

        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickSizeOuter(0);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(6)
            .tickSizeOuter(0);
        
    }

    updateVis() {
        let vis = this;
        //These are the age ranges that we will be using
        let ranges = [
            {min: 20, max: 25, label: "20-25"},
            {min: 26, max: 30, label: "26-30"},
            {min: 31, max: 35, label: "31-35"},
            {min: 36, max: 40, label: "36-40"},
            {min: 41, max: 45, label: "41-45"},
            {min: 46, max: 50, label: "46-50"},
            {min: 51, max: 55, label: "51-55"},
            {min: 56, max: 60, label: "56-60"}
        ]
        let order = ["20-25", "26-30", "31-35", "36-40", "41-45", "46-50", "51-55", "56-60", "Other"] //This is the order I want my Chart
        const countEmployees = d3.rollups(vis.data, v => v.length, d => {
            var age = d.Age
            var ageGroup = ranges.find(range => age >= range.min && age <= range.max)
            return ageGroup ? ageGroup.label : "Other"

        },d => d.Gender);
        //Make an aggregated list to make creating the barchart really easy
        vis.aggregatedData = Array.from(countEmployees, ([key, count]) => ({
            key, 
            values: Array.from(count, ([gender, count]) => ({gender, count}))
        }));
        //Order the Aggregated list
        vis.aggregatedData.sort((a,b) =>{
            return order.indexOf(a.key) - order.indexOf(b.key)
        })
        
        vis.xValue = vis.aggregatedData.map(d => d.key);
        vis.groups = vis.aggregatedData[0].values.map(d => d.gender);
        vis.groupCount = vis.groups.length;

        vis.xScale.domain(vis.xValue);
        vis.yScale.domain([0, d3.max(vis.aggregatedData, d => d3.max(d.values, d => d.count))])

        vis.renderVis();
    }

    renderVis() {
        let vis = this;
        const bars = vis.chart.selectAll('.bar')
            .data(vis.aggregatedData)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", d => "translate(" + vis.xScale(d.key) + ",0)")
          .selectAll("rect")
            .data(d => d.values)
          .enter().append("rect")
            .attr("x", d => vis.xScale.bandwidth() / vis.groupCount * vis.groups.indexOf(d.gender))
            .attr("y", d => vis.yScale(d.count))
            .attr("width", vis.xScale.bandwidth() / vis.groupCount)
            .attr("height", d => vis.height - vis.yScale(d.count))
            .attr("fill", d => vis.colorScale(d.gender));

        vis.chart.append('g')
            .attr("class", "x axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis);

        vis.chart.append('g')
            .attr("class", "y axis")
            .call(vis.yAxis);

    }
}