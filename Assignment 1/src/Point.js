class Point {
  constructor() {
    this.type = 'point';
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

    // quit using the buffer to send the attribute
    // Solution 1:
    gl.disableVertexAttribArray(a_Position);
    // Solution 2:
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ xy[0], xy[1]]), gl.DYNAMIC_DRAW); // rather than disabling the array (1st solution), write the point we want to draw into the buffer data
    // only thing with this method is that have to make sure u created the buffer before u use it the first time

    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0); // we've enabled the buffer array so this command isn't doing anything (we're not setting the position we want to set. instead, it's just taking the last thing that was on the buffer, which is a triangle, so at the first vertex on the triangle we end up drawing a point.) so if we want the points to behave separately, we need to disable the vertex attribute array (done above)
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); // 4f means 4 floating point vals
    
    // Pass the size of a point to a u_Size variable
    gl.uniform1f(u_Size, size); // just 1 floating point val bc that's the size we've defined
    
    // Draw
    gl.drawArrays(gl.POINTS, 0, 1);
    // drawTriangle( [xy[0], xy[1], xy[0] + 0.1, xy[1], xy[0], xy[1] + 0.1] );
  }
    
}