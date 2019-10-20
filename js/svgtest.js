function generatePoints(num, dimension) {
    var points = [];
    for (var i = 0; i < num; i++) {
        var x = Math.random();
        var y = Math.random();
        points.push([x * dimension, y * dimension]);
    }
    return points;
}

function smoothPoints(points, iterations, dimension) {
    for (var i = 0; i < iterations; i++) {
        points = voronoi(points, dimension)
                    .polygons(points)
                    .map(centroid);
    }
    return points;
}

function voronoi(points, dimension) {
    return d3.voronoi().extent([[-dimension, -dimension], [dimension, dimension]])(points);
}

function centroid(points) {
    var x = 0;
    var y = 0;
    for (var i = 0; i < points.length; i++) {
        x += points[i][0];
        y += points[i][1];
    }
    return [x/points.length, y/points.length];
}

function drawCircle() {
    d3.select("body").append("svg").attr("width", 50).attr("height", 50).append("circle").attr("cx", 25).attr("cy", 25).attr("r", 25).style("fill", "purple");
}

function generateSmoothPoints(num, dimension) {
    var points = generatePoints(num, dimension);
    points = points.sort(function (a, b) {
        return a[0] - b[0];
    });
    points = smoothPoints(points, 1, dimension);
    console.log(points);
}

