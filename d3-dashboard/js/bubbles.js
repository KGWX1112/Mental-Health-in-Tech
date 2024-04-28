class BubbleChart {
    
    constructor(_config, _data, _colorScale) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 400,
            containerHeight: _config.containerHeight || 400,
            margin: _config.margin || {top: 40, right: 20, bottom: 20, left: 35}
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
            .attr('height', vis.config.containerHeight);
        
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.radiusScale = d3.scaleLinear()
            .range([15, 35])   

        vis.colorScale.domain(vis.data.map(d => d.treatment))
        
        vis.svg.selectAll(".legned")
            .data(vis.colorScale.domain())
            .join("rect")
            .attr("class", "legend")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", vis.colorScale)
            .attr("x", 0)
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

    /**
     * this function is used to prepare the data and update the scales before we render the actual vis
     */
    updateVis() {
        let vis = this;

        vis.data = vis.data.filter(d => d.coworkers != "Some of them")
        vis.data = vis.data.filter(d => d.supervisor != "Some of them")
        vis.data = vis.data.filter(d => d.mental_health_interview != "Maybe")

        const countEmployees = d3.rollups(vis.data, v => v.length, d => d.coworkers + "-" + d.supervisor + "-"  + d.mental_health_interview , d=> d.treatment);
        vis.aggregatedData = Array.from(countEmployees, ([key, count]) => ({
            key, 
            values: Array.from(count, ([treatment, count]) => ({treatment, count}))
        }));

        vis.radiusScale.domain([0, (d3.max(vis.aggregatedData, d => d3.max(d.values, d => d.count)))])
        
        vis.simulation = d3.forceSimulation(vis.aggregatedData.values) //https://observablehq.com/@d3/clustered-bubbles
            .force("x", d3.forceX(vis.width/2).strength(0.01))
            .force("y", d3.forceY(vis.height/2).strength(0.01))
            .force("collide", d3.forceCollide().radius(20))
            .on("tick", ticked);

            function ticked(){

            }
        
        vis.aggregatedData.forEach(d=>{
            d.values.forEach(f =>{
                f.x = Math.random() * vis.width 
                f.y = Math.random() * vis.height
                f.label = d.key
            })
            
        })
        vis.renderVis();
    }

    /**
     * this function contains the d3 code for binding data visual elements
     */
    renderVis() {
        let vis = this;   
        vis.chart.selectAll("g").remove()//removes the circles so they can be updated
        //draw the bubbles
        var bubbles = vis.chart.selectAll('.bubble')
            .data(vis.aggregatedData)
            .enter().append("g")
            .attr("class", "bubble")
        bubbles.selectAll("circle")   
            .data(d => d.values)
            .enter().append("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", d => vis.radiusScale(d.count))
            .attr("fill", d=> vis.colorScale(d.treatment))

        vis.simulation = d3.forceSimulation(vis.aggregatedData.values) //https://observablehq.com/@d3/clustered-bubbles
            .force("x", d3.forceX(vis.width/2).strength(0.01))
            .force("y", d3.forceY(vis.height/2).strength(0.01))
            .force("collide", d3.forceCollide().radius(20))
            .on("tick", ticked);

            function ticked(){

            }
        
        var labels = vis.chart.selectAll(".label")
            .data(vis.aggregatedData)
            .enter().append("g")
            .attr("class", "label")
            
        labels.selectAll("text")
            .data(d => d.values)
            .enter().append("text")
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("dy", "0.35em")
            .text(d => d.label)
            .style("text-anchor", "middle")
            .style("font-size", "8px")
            .style("fill", "white");

            
    }
}