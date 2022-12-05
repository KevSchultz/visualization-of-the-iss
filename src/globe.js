const width = 960;
const height = 500;
const config = {
  speed: 0.05,
  verticalTilt: -30,
  horizontalTilt: 0
}
let locations = [];
const svg = d3.select('svg')
    .attr('width', width).attr('height', height);
const markerGroup = svg.append('g');
const projection = d3.geoOrthographic();
const initialScale = projection.scale();
const path = d3.geoPath().projection(projection);
const center = [width/2, height/2];   

function drawGlobe() {  
    d3.json('http://api.open-notify.org/iss-now.json').then(function(data) {
        locations = [[data.iss_position.longitude, data.iss_position.latitude], [data.iss_position.longitude, data.iss_position.latitude]]
    });
    d3.json("https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-110m.json")
        .then( function(worldData) {
            //worldData = values[0]
            //locationData = values[1]
            svg.selectAll(".segment")
                .data(topojson.feature(worldData, worldData.objects.countries).features)
                .enter().append("path")
                .attr("class", "segment")
                .attr("d", path)
                .attr("x", "50%")
                .attr("y", "50%")
                .style("stroke", "white")
                .style("stroke-width", "1px")
                .style("fill", (d, i) => 'green')
                .style("opacity", "1");
                drawMarkers();
    });
}

function drawGraticule() {
    const graticule = d3.geoGraticule()
        .step([10, 10]);

    svg.append("circle")
        .attr("r", 250)
        .style("fill", "blue")
        .attr("cx", "50%")
        .attr("cy", "50%")
    
    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path)
        .style("fill", "blue")
        .style("stroke", "#ccc");
}

function enableRotation() {
    d3.timer(function (elapsed) {
        projection.rotate([config.speed * elapsed - 120, config.verticalTilt, config.horizontalTilt]);
        svg.selectAll("path").attr("d", path);
        drawMarkers();
    });
}        

function drawMarkers() {
    const markers = markerGroup.selectAll('circle')
        .data(locations);
    markers
        .enter()
        .append('circle')
        .merge(markers)
        .attr('cx', d => projection(d)[0])
        .attr('cy', d => projection(d)[1])
        .attr('fill', d => {
            //console.log(locations[0]);
            const coordinate = locations[0];
            var gdistance = d3.geoDistance(coordinate, projection.invert(center));
            return gdistance > 1.57 ? 'none' : 'red';
        })
        .attr('r', 7);

    markerGroup.each(function () {
        this.parentNode.appendChild(this);
    });
}

function init_globe() {
    setTimeout(drawGlobe(), 5000);    
    drawGraticule();
    enableRotation();
}

export {init_globe};
