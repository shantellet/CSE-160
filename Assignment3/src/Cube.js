class Cube {
    constructor() {
      this.type = "Cube";
      // this.position = [0.0, 0.0, 0.0, 0.0];
      this.color = [0.8, 0.7, 0.5, 1.0];
      // this.size = 5.0;
      // this.segments = 10;
      this.matrix = new Matrix4();
    }
    
    render() {
      // var xy = this.position;
      var rgba = this.color;
      // var size = this.size;
      // var xy = g_points[i];
      // var rgba = g_colors[i];
      // var size = g_sizes[i];
  
      // Pass the position of a point to a_Position variable
      // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0); // dont need this (from Point class) b/c for triangle we're using vertexAttribPointer
      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); // 4f means 4 floating point vals
      
      // Pass the matrix to u_ModelMatrix attribute before drawing the cube
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      // Front of cube
      drawTriangle3D( [0, 0, 0,  1, 1, 0,  1, 0, 0] );
      drawTriangle3D( [0, 0, 0,  0, 1, 0,  1, 1, 0] );

      // Add fake Lighting (differnt amount of light bouncing off each surface). Pass the color of a point to u_FragColor uniform variable
      gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
      // for more sides, they might multiply by a slightly diff num, like 0.8

      // Top of cube
      drawTriangle3D( [0, 1, 0,  0, 1, 1,  1, 1, 1] );
      drawTriangle3D( [0, 1, 0,  1, 1, 1,  1, 1, 0] );

      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

      // Bottom of cube
      drawTriangle3D([0, 0, 0,  1, 0, 0,  0, 0, 1]);
      drawTriangle3D([1, 0, 0,  1, 0, 1,  0, 0, 1]);

      gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);

      // Left of cube
      drawTriangle3D([0, 0, 0,  0, 1, 0,  0, 0, 1]);
      drawTriangle3D([0, 1, 0,  0, 1, 1,  0, 0, 1]);

      // Right of cube
      drawTriangle3D([1, 0, 0,  1, 0, 1,  1, 1, 0]);
      drawTriangle3D([1, 1, 0,  1, 0, 1,  1, 1, 1]);
      
      gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
      // Back of cube
      drawTriangle3D([0, 0, 1,  1, 0, 1,  1, 1, 1]);
      drawTriangle3D([0, 0, 1,  1, 1, 1,  0, 1, 1]);

    }
      
  }