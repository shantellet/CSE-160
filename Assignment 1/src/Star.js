class Star {
  constructor() {
    this.type = "star";
    this.position = [0.0, 0.0];
    this.color = [1.0, 1.0, 0.0, 1.0];
    this.size = 5.0;
    this.innerSize = 2.5;
    this.points = 5;
  }

  render() {
    var xy = this.position;
    var rgba = this.color;
    var outerRadius = this.size / 100;
    var innerRadius = this.innerSize / 100;
    var numPoints = this.points;

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    let angleStep = 360 / numPoints;
    let vertices = [];

    for (let i = 0; i < numPoints; i++) {
      let angle1 = i * angleStep * Math.PI / 180;
      let angle2 = (i + 0.5) * angleStep * Math.PI / 180;

      let x1 = xy[0] + outerRadius * Math.cos(angle1);
      let y1 = xy[1] + outerRadius * Math.sin(angle1);

      let x2 = xy[0] + innerRadius * Math.cos(angle2);
      let y2 = xy[1] + innerRadius * Math.sin(angle2);

      vertices.push(x1, y1);
      vertices.push(x2, y2);
    }

    for (let i = 0; i < vertices.length; i += 4) {
      drawTriangle([xy[0], xy[1], vertices[i], vertices[i + 1], vertices[i + 2], vertices[i + 3]]);
    }
  }
}
