class Triangle {
  constructor() {
    this.type = "triangle";
    this.position = [0.0, 0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
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
    // gl.drawArrays(gl.POINTS, 0, 1);
    drawTriangle( [xy[0], xy[1], xy[0] + 0.1, xy[1], xy[0], xy[1] + 0.1] );
  }
    
}


// function that draws a triangle at the position we want it to draw
function drawTriangle(vertices) { // video didnt do this but i added gl as a param otherwise it's not in scope
//   var vertices = new Float32Array([ // declare vertices at this location. this is in JS on the cpu.
//     // Float32Array tells JS we want it to be precisely floats with 32 bits bc that's the kind we want to pass to GLSL
//     0, 0.5,   -0.5, -0.5,   0.5, -0.5
//   ]);
  var n = 3; // The number of vertices

  // Create a buffer object
  // to pass the vertices to the gpu
  var vertexBuffer = gl.createBuffer(); // make a buffer on the gpu
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write data into the buffer object
  // sends the data we defined (the vertices array) to live in a buffer array on the gpu
//   gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW); // data coming as JS array, so convert it to Float32Array before giving it to GLSL

  // connect it to a_Position (so far buffer array isn't connected to anything)
  // already in ColoredPoint.js so don't need it again
  // var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  // if (a_Position < 0) {
  //   console.log('Failed to get the storage location of a_Position');
  //   return -1;
  // }
  // assign the buffer object to a_Position variable
  // instead of calling vertexAttrib (single attribute), we're passing a pointer (the pointer for the buffer we just created)
  // take buffer we just assigned. assign it to a_Position pointer, which points to the a_Position GLSL var
  // the 2 means we have 2 elements per vertex (x, y per vertex)
  // the two 0s are for offset and stride (for using interleave) but IGNORE IT
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);
  
  gl.drawArrays(gl.TRIANGLES, 0, n);
//   return n;
}