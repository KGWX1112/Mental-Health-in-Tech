class Choropleth {
    constructor(_config, _data, _map, _colorScale, _dispatcher) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 1200,
            containerHeight: _config.containerHeight || 500,
            margin: _config.margin || {top: 15, right: 0, bottom: 15, left: 15}
        };
        this.data = _data
        this.map = _map;
        this.colorScale = _colorScale;
        this.dispatcher = _dispatcher || null;
        this.initVis();
    }
    initVis() {
        let vis = this
        //All of this Defines the SVG
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
        vis.svg = d3.select(vis.config.parentElement)
            .append('svg')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);
        
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
        
        //This creates a scale for the map
        let projection = d3.geoMercator();
        projection.fitSize([1400,480], vis.map);
        //This us a draw method for the map
        vis.generator = d3.geoPath()
			.projection(projection);

        vis.aggregateData = {};
        //This Aggregates the Values for the United States and Canada in an Array Defined Above
        vis.data.forEach(d =>{
            if (vis.aggregateData[d.state] == null)
                vis.aggregateData[d.state] = 1
            else
                vis.aggregateData[d.state] = vis.aggregateData[d.state] + 1
        })
        
    }

    updateVis() {
        let vis = this;
        vis.colorScale.domain([0, 130]) 

        vis.renderVis();
    }

    renderVis() {
        let vis = this;     
        vis.chart.selectAll('paths')
			.data(vis.map.features)
			.enter()
			.append('path')
			.attr('d', vis.generator)
			.attr('stroke', 'black')
            .style("opacity", 1)
            .attr("fill", function(d){
                let statePop = vis.aggregateData[d.properties.NAME] 
				return statePop ? vis.colorScale(statePop) : "#ccc"; //This last RGB value is a else value and is a light gray
            })
            .on("click", function(e,d){ 
                //These check as to which state you are selecting
                const isSelected = d3.select(this).classed("active");
                d3.select(this).classed("active", !isSelected);
                //This an array of the selected states. if you were to select the same state twice, it will remove it from array
                const selectedStates = vis.chart.selectAll('path.active')
                    .data()
                    .map(k => k.properties.NAME);
                //This if statment checks what states are selected and changes their opacity 
                if (selectedStates.indexOf(d.properties.NAME) !== -1){
                    d3.select(this)
                        .transition()
                        .duration(1000)
                        .style("opacity", 0.7)
                }
                else{
                    d3.select(this)
                        .transition()
                        .duration(1000)
                        .style("opacity", null)
                }
    
                //call the dispatcher to actually update the graphs
                vis.dispatcher.call("filterStates", e, selectedStates);

            })
    }
}