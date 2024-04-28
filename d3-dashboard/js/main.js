let data, map, barchart1, barchart2, bubble;
const dispatcher = d3.dispatch("filterStates")

Promise.all([
    d3.csv("data/survey.csv"),
    d3.json("data/us_states_data.json")
]).then(d => {
    data = d[0];
    map = d[1]

    data = data.filter(d => {
        return d.Country == "United States"
    })
    //This is to consolidate Genders. Some Genders in the Data Set were clearly jokes like one just said "Nah"
    data.forEach(d => {
        switch(d.Gender) {
            case "Male":
            case "male":
            case "M":
            case "m":
                d.Gender = "M"
            break;
            case "Female":
            case "female":
            case "F":
            case "f":
                d.Gender = "F"
            break;
            default:
                d.Gender = "O"
        }
        data = data.filter(d => d.Gender != "O")

    });    

    const colorScale = d3.scaleSequential(d3.interpolateYlGn);
    const colorScaleOther = d3.scaleOrdinal().range(['#FFA500','#0000FF'])

    map = new Choropleth({parentElement: "#map"}, data, map, colorScale, dispatcher)
    map.updateVis()

    barchart1 = new BarChart1({parentElement: "#barchart1"}, data, colorScaleOther)
    barchart1.updateVis()

    barchart2 = new BarChart2({parentElement: "#barchart2"}, data, colorScaleOther)
    barchart2.updateVis()

    bubble = new BubbleChart({parentElement: "#bubbles"}, data, colorScaleOther)
    bubble.updateVis()

})
.catch(error => console.error(error));

dispatcher.on("filterStates", selectedStates => {
    if (selectedStates.length === 0){
        barchart1.data = data;
        barchart2.data = data;
        bubble.data = data;
    }else{
        barchart1.data = data.filter(d => selectedStates.includes(d.state))
        barchart2.data = data.filter(d => selectedStates.includes(d.state))
        bubble.data = data.filter(d => selectedStates.includes(d.state))
    }
    barchart1.updateVis();
    barchart2.updateVis();
    bubble.updateVis();
})

