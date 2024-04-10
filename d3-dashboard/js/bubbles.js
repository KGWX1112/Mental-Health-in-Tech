class BubbleChart {
    
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 400,
            containerHeight: _config.containerHeight || 400,
            margin: _config.margin || {top: 25, right: 20, bottom: 20, left: 35}
        };
        this.data = _data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.data = vis.data.filter(d => d.coworkers != "Some of them")
        vis.data = vis.data.filter(d => d.supervisor != "Some of them")
        vis.data = vis.data.filter(d => d.mental_health_interview != "Maybe")

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
        vis.svg = d3.select(vis.config.parentElement)
            .append('svg')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);
        
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.radiusScale = d3.scaleLinear()
            .range([15, 35])

        vis.colorScale = d3.scaleOrdinal()
            .range(['#FFA500','#0000FF'])

    
  
    }

    /**
     * this function is used to prepare the data and update the scales before we render the actual vis
     */
    updateVis() {
        let vis = this;
        let coords = [
            {x: 150, y: 250},
            {x: 210, y: 300},
            {x: 310, y: 350},
            {x: 320, y: 40},
            {x: 40, y: 250},
            {x: 40, y: 40},
            {x: 50, y: 200},
            {x: 200, y: 100},
            {x: 150, y: 190},
            {x: 45, y: 325},
            {x: 310, y: 250},
            {x: 250, y: 40},
            {x: 320, y: 420},
            {x: 150, y: 50},
            {x: 30, y: 100},
            {x: 100, y: 150},
            {x: 260, y: 150},
            {x: 310, y: 300}
        ]
        const countEmployees = d3.rollups(vis.data, v => v.length, d => d.coworkers + "-" + d.supervisor + "-"  + d.mental_health_interview + "-" + d.treatment);
        vis.aggregatedData = Array.from(countEmployees, ([key, count]) => ({key, count}));
        console.log(this.aggregatedData)

        vis.radiusScale.domain([0, (d3.max(vis.aggregatedData)).count])
        var i = 0
        vis.aggregatedData.forEach(d=>{ 
            d.x = coords[i % coords.length].x
            d.y = coords[i % coords.length].y
            i++
        })

        vis.renderVis();
    }

    /**
     * this function contains the d3 code for binding data visual elements
     */
    renderVis() {
        let vis = this;   
        
        var bubbles = vis.chart.selectAll('.bubble')
            .data(vis.aggregatedData)
            .enter().append("circle")
            .attr("class", "bubble")
            .attr("id", d => d.key)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", d => vis.radiusScale(d.count))
            .attr("fill", "steelblue")
        
        var labels = vis.chart.selectAll(".label")
            .data(vis.aggregatedData)
            .enter().append("text")
            .attr("class", "label")
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .text(d => d.key) 
            .attr("dy", "0.35em")
            .style("text-anchor", "middle")
            .style("font-size", "8px")
            .style("fill", "white");
        
    }
}