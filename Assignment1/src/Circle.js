class Circle {
    constructor() {
      this.type = "circle";
      this.position = [0.0, 0.0, 0.0, 0.0];
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.size = 5.0;
      this.segments = 10;
    }
    
    render() {
      var xy = this.position;
      var rgba = this.color;
      var size = this.size;
      // var xy = g_points[i];
      // var rgba = g_colors[i];
      // var size = g_sizes[i];
  
      // Pass the position of a point to a_Position variable
      // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0); // dont need this (from Point class) b/c for triangle we're using vertexAttribPointer
      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); // 4f means 4 floating point vals
      
      // Pass the size of a point to a u_Size variable
      gl.uniform1f(u_Size, size); // just 1 floating point val bc that's the size we've defined
      
      // Draw
      var d = this.size / 200.0; // delta for length of the sides
      // gl.drawArrays(gl.POINTS, 0, 1);


      let angleStep = 360 / this.segments;
      for (var angle = 0; angle < 360; angle += angleStep) {
        let centerPt = [xy[0], xy[1]];
        let angle1 = angle;
        let angle2 = angle + angleStep;
        let vec1 = [Math.cos(angle1 * Math.PI / 180) * d, Math.sin(angle1 * Math.PI / 180) * d];
        let vec2 = [Math.cos(angle2 * Math.PI / 180) * d, Math.sin(angle2 * Math.PI / 180) * d];
        let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
        let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];

        drawTriangle( [xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]] );
      }

    }
      
  }