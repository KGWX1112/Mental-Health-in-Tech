class BarChart1 {
    constructor(_config, _data, _colorScale) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 400,
            containerHeight: _config.containerHeight || 400,
            margin: _config.margin || {top: 20, right: 20, bottom: 20, left: 30}
        };
        this.data = _data;
        this.colorScale = _colorScale

        this.initVis();
    }
    
    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
        
        vis.svg = d3.select(vis.config.parentElement)
            .append('svg')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight)
        
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

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

        vis.svg.selectAll(".legned")
            .data(vis.colorScale.domain())
            .join("rect")
            .attr("class", "legend")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", vis.colorScale)
            .attr("x", 20)
            .attr("y", (d,i) => i * 20)

        vis.svg.selectAll(".legend-text")
            .data(vis.colorScale.domain())
            .join("text")
            .attr("class", "legend-text")
            .attr("x", 46)
            .attr("y", (d,i) => 11 + i * 20)
            .style('fill', 'black')
            .style("text-anchor", "middle")
            .style("font-size", "8px")
            .style("fill", "black")
            .text(d => "Treatment: " + d);
        
    }

    updateVis() {
        let vis = this;
        let order = ["1-5", "6-25", "26-100", "100-500", "500-1000", "More than 1000"]
        const countEmployees = d3.rollups(vis.data, v => v.length, d => d.no_employees, d => d.treatment);
        vis.aggregatedData = Array.from(countEmployees, ([key, count]) => ({
            key, 
            values: Array.from(count, ([treatment, count]) => ({treatment, count}))
        }));

        vis.aggregatedData.sort((a,b) =>{
            return order.indexOf(a.key) - order.indexOf(b.key)
        })
        
        vis.xValue = vis.aggregatedData.map(d => d.key);
        vis.groups = vis.aggregatedData[0].values.map(d => d.treatment);
        vis.groupCount = vis.groups.length;

        vis.xScale.domain(vis.xValue);
        vis.yScale.domain([0, d3.max(vis.aggregatedData, d => d3.max(d.values, d => d.count))])

        vis.renderVis();
    }

    renderVis() {
        let vis = this;
        vis.chart.selectAll("g").remove() //This is so the bars updates easy
        const bars = vis.chart.selectAll('.bar')
            .data(vis.aggregatedData)
            .enter().append("g")
            .attr("class", "bar")
            .attr("id", d => d.key)
            .attr("transform", d => "translate(" + vis.xScale(d.key) + ",0)")
        
        bars.selectAll("rect")
            .data(d => d.values)
            .enter().append("rect")
            .attr("x", d => vis.xScale.bandwidth() / vis.groupCount * vis.groups.indexOf(d.treatment))
            .attr("y", d => vis.yScale(d.count))
            .attr("width", vis.xScale.bandwidth() / vis.groupCount)
            .attr("height", d => vis.height - vis.yScale(d.count))
            .attr("fill", d => vis.colorScale(d.treatment));
        
        vis.chart.append('g')
            .attr("class", "x axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis);

        vis.chart.append('g')
            .attr("class", "y axis")
            .call(vis.yAxis);

    }
}