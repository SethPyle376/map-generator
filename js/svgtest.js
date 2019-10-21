function buildSvg(dimension) {
    return d3.select("body").append("svg").attr("width", dimension).attr("height", dimension);
}

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

function generateSmoothPoints(num, dimension) {
    var svg1 = buildSvg(dimension);
    var svg2 = buildSvg(dimension);
    var points = generatePoints(num, dimension);
    points = points.sort(function (a, b) {
        return a[0] - b[0];
    });
    drawPoints(svg1, points);
    points = smoothPoints(points, 1, dimension);
    drawPoints(svg2, points);
    return points;
}

function generateMesh(points, dimension) {
    var vor = voronoi(points, dimension);
    var vertices = [];
    var vertexIds = {};
    var adjacent = [];
    var edges = [];
    var triangles = [];

    for (var i = 0; i < vor.edges.length; i++) {
        var edge = vor.edges[i];

        if (edge == undefined)
            continue;
        
        var edge0 = vertexIds[edge[0]];
        var edge1 = vertexIds[edge[1]];

        if (edge0 == undefined) {
            edge0 = vertices.length;
            vertexIds[edge[0]] = edge0;
            vertices.push(edge[0]);
        }

        if (edge1 == undefined) {
            edge1 = vertices.length;
            vertexIds[edge[1]] = edge1;
            vertices.push(edge[1]);
        }

        adjacent[edge0] = adjacent[edge0] || [];
        adjacent[edge0].push(edge1);

        adjacent[edge1] = adjacent[edge1] || [];
        adjacent[edge1].push(edge0);

        edges.push([edge0, edge1, edge.left, edge.right]);

        triangles[edge0] = triangles[edge0] || [];
        if (!triangles[edge0].includes(edge.left))
            triangles[edge0].push(edge.left);
        if (edge.right && !triangles[edge0].includes(edge.right))
            triangles[edge0].push(edge.right);
        
        triangles[edge1] = triangles[edge1] || [];
        if (!triangles[edge1].includes(edge.left))
            triangles[edge1].push(edge.left);
        if (edge.right && !triangles[edge1].includes(edge.right))
            triangles[edge1].push(edge.right);
    }

    var mesh = {
        pts: points,
        vor: vor,
        vertices: vertices,
        adjacent: adjacent,
        triangles: triangles,
        edges: edges,
        dimension: dimension
    }
    mesh.map = function (f) {
        var mapped = vertices.map(f);
        mapped.mesh = mesh;
        return mapped;
    }
    return mesh;
}

function generateSmoothMesh(num, dimension) {
    var points = generateSmoothPoints(num, dimension);
    var mesh = generateMesh(points, dimension);
    var svg = buildSvg(dimension);
    drawMesh(svg, mesh);
}

function drawPoints(svg, points) {
    var circle = svg.selectAll('circle').data(points);
    circle.enter().append("circle");
    circle.exit().remove();
    d3.selectAll('circle')
        .attr('cx', function (d) { return d[0]; })
        .attr('cy', function (d) { return d[1]; })
        .attr('r', 2);
}

function drawTriangle(tri) {
    var path = d3.path();
    path.moveTo(tri[0][0], tri[0][1]);
    for (var i = 1; i < tri.length; i++) {
        path.lineTo(tri[i][0], tri[i][1]);
    }
    return path.toString();
}

function drawMesh(svg, mesh) {
    var paths = svg.selectAll('path-field').data(mesh.triangles);
    paths.enter().append('path').classed('field', true);
    paths.exit().remove();
    svg.selectAll('path.field').attr('d', drawTriangle).attr("stroke", "black").attr("stroke-width", 1).attr("fill", "none");
}
