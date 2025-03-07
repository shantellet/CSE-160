class Cube {
    constructor() {
      this.type = "Cube";
      // this.position = [0.0, 0.0, 0.0, 0.0];
      this.color = [0.8, 0.7, 0.5, 1.0];
      // this.size = 5.0;
      // this.segments = 10;
      this.matrix = new Matrix4();
      this.normalMatrix = new Matrix4();
      this.textureNum = -2; // default is to use the texture
      // this.cubeVerts32 = new Float32Array([
      //   0, 0, 0,  1, 1, 0,  1, 0, 0, // front
      //   0, 0, 0,  0, 1, 0,  1, 1, 0,
      //   0, 1, 0,  0, 1, 1,  1, 1, 1, // top
      //   0, 1, 0,  1, 1, 1,  1, 1, 0,
      //   0, 0, 0,  0, 0, 1,  1, 0, 1, // bottom
      //   0, 0, 0,  1, 0, 1,  1, 0, 0,
      //   0, 1, 0,  0, 1, 1,  0, 0, 0, // left
      //   0, 0, 0,  0, 1, 1,  0, 0, 1,
      //   1, 1, 0,  1, 1, 1,  1, 0, 0, // right
      //   1, 0, 0,  1, 1, 1,  1, 0, 1,
      //   0, 0, 1,  1, 1, 1,  1, 0, 1, // back
      //   0, 0, 1,  0, 1, 1,  1, 1, 1
      // ]);
      this.vertices = [
        0, 0, 0,  1, 1, 0,  1, 0, 0, // front
        0, 0, 0,  0, 1, 0,  1, 1, 0,
        0, 1, 0,  0, 1, 1,  1, 1, 1, // top
        0, 1, 0,  1, 1, 1,  1, 1, 0,
        0, 0, 0,  0, 0, 1,  1, 0, 1, // bottom
        0, 0, 0,  1, 0, 1,  1, 0, 0,
        0, 1, 0,  0, 1, 1,  0, 0, 0, // left
        0, 0, 0,  0, 1, 1,  0, 0, 1,
        1, 1, 0,  1, 1, 1,  1, 0, 0, // right
        1, 0, 0,  1, 1, 1,  1, 0, 1,
        0, 0, 1,  1, 1, 1,  1, 0, 1, // back
        0, 0, 1,  0, 1, 1,  1, 1, 1
      ];
      this.uvs = [
        0, 0,  1, 1,  1, 0, // front
        0, 0,  0, 1,  1, 1,
        0, 0,  0, 1,  1, 1, // top
        0, 0,  1, 1,  1, 0,
        0, 0,  0, 1,  1, 1, // bottom
        0, 0,  1, 1,  1, 0,
        0, 0,  0, 1,  1, 1, // left
        0, 0,  1, 1,  1, 0,
        0, 0,  0, 1,  1, 1, // right
        0, 0,  1, 1,  1, 0,
        0, 0,  0, 1,  1, 1, // back
        0, 0,  1, 1,  1, 0
      ];
    
      this.normals = [
        0,0,-1, 0,0,-1, 0,0,-1, // front
        0,0,-1,  0,0,-1, 0,0,-1,
        0,1,0, 0,1,0, 0,1,0, // top
        0,1,0, 0,1,0, 0,1,0,
        0,-1,0, 0,-1,0, 0,-1,0, // bottom
        0,-1,0, 0,-1,0, 0,-1,0,
        -1,0,0, -1,0,0, -1,0,0, // left
        -1,0,0, -1,0,0, -1,0,0,
        1,0,0, 1,0,0, 1,0,0, // right
        1,0,0, 1,0,0, 1,0,0,
        0,0,1, 0,0,1, 0,0,1, // back
        0,0,1, 0,0,1, 0,0,1
      ];
      
    }
    
    // render() {
    //   // var xy = this.position;
    //   var rgba = this.color;
    //   // var size = this.size;
    //   // var xy = g_points[i];
    //   // var rgba = g_colors[i];
    //   // var size = g_sizes[i];

    //   // Pass the texture number
    //   gl.uniform1i(u_whichTexture, this.textureNum);
  
    //   // Pass the position of a point to a_Position variable
    //   // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0); // dont need this (from Point class) b/c for triangle we're using vertexAttribPointer
    //   // Pass the color of a point to u_FragColor variable
    //   gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); // 4f means 4 floating point vals
      
    //   // Pass the matrix to u_ModelMatrix attribute before drawing the cube
    //   gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    //   gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);


    //   // Front of cube
    //   // drawTriangle3D( [0, 0, 0,  1, 1, 0,  1, 0, 0] );
    //   // vertex pos 1         2        3      1       2       3 uv coords for each vertices 
    //   // drawTriangle3DUV( [0, 0, 0,  1, 1, 0,  1, 0, 0], [1, 0,  0, 1,  1, 1] );
    //   drawTriangle3DUVNormal( 
    //     [0, 0, 0,  1, 1, 0,  1, 0, 0], 
    //     [0, 0,  1, 1,  1, 0], 
    //     [0, 0, -1,  0, 0, -1,  0, 0, -1] // for front of cube, normal is pointing back towards me, so in the negative z direction
    //   ); // changed uv vals so they span the square. rather than seeing 2 triangles we see smoothly varying UV over the front face of the square
    //   drawTriangle3DUVNormal( [0, 0, 0,  0, 1, 0,  1, 1, 0], [0, 0,  0, 1,  1, 1], [0, 0, -1,  0, 0, -1,  0, 0, -1] );
    //   // drawTriangle3D( [0, 0, 0,  0, 1, 0,  1, 1, 0] );

    //   // Add fake Lighting (differnt amount of light bouncing off each surface). Pass the color of a point to u_FragColor uniform variable
    //   // gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
    //   // for more sides, they might multiply by a slightly diff num, like 0.8

    //   // Top of cube
    //   drawTriangle3DUVNormal([0, 1, 0,  0, 1, 1,  1, 1, 1], [0, 0,  0, 1,  1, 1], [0,1,0, 0,1,0, 0,1,0]);
    //   drawTriangle3DUVNormal([0, 1, 0,  1, 1, 1,  1, 1, 0], [0, 0,  1, 1,  1, 0], [0,1,0, 0,1,0, 0,1,0]);

    //   // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    //   // Bottom of cube
    //   drawTriangle3DUVNormal([0, 0, 0,  0, 0, 1,  1, 0, 1], [0, 0,  0, 1,  1, 1], [0,-1,0, 0,-1,0, 0,-1,0]);
    //   drawTriangle3DUVNormal([0, 0, 0,  1, 0, 1,  1, 0, 0], [0, 0,  1, 1,  1, 0], [0,-1,0, 0,-1,0, 0,-1,0]);

    //   // gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);

    //   // Left of cube
    //   drawTriangle3DUVNormal([0, 1, 0,  0, 1, 1,  0, 0, 0], [0, 0,  0, 1,  1, 1], [-1,0,0, -1,0,0, -1,0,0]);
    //   drawTriangle3DUVNormal([0, 0, 0,  0, 1, 1,  0, 0, 1], [0, 0,  1, 1,  1, 0], [-1,0,0, -1,0,0, -1,0,0]);

    //   // Right of cube
    //   drawTriangle3DUVNormal([1, 1, 0,  1, 1, 1,  1, 0, 0], [0, 0,  0, 1,  1, 1], [1,0,0, 1,0,0, 1,0,0]);
    //   drawTriangle3DUVNormal([1, 0, 0,  1, 1, 1,  1, 0, 1], [0, 0,  1, 1,  1, 0], [1,0,0, 1,0,0, 1,0,0]);
      
    //   // gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
    //   // Back of cube
    //   drawTriangle3DUVNormal([0, 0, 1,  1, 1, 1,  1, 0, 1], [0, 0,  0, 1,  1, 1], [0,0,1, 0,0,1, 0,0,1]);
    //   drawTriangle3DUVNormal([0, 0, 1,  0, 1, 1,  1, 1, 1], [0, 0,  1, 1,  1, 0], [0,0,1, 0,0,1, 0,0,1]);

    // }

    render3DUVNormalFast() {
      var rgba = this.color;

      // Pass the texture number
      gl.uniform1i(u_whichTexture, this.textureNum);
  
      // Pass the position of a point to a_Position variable
      // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0); // dont need this (from Point class) b/c for triangle we're using vertexAttribPointer
      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); // 4f means 4 floating point vals
      
      // Pass the matrix to u_ModelMatrix attribute before drawing the cube
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

      drawTriangle3DUVNormal(this.vertices, this.uvs, this.normals);
    }
    
  //   renderfast() {
  //     // var xy = this.position;
  //     var rgba = this.color;
  //     // var size = this.size;
  //     // var xy = g_points[i];
  //     // var rgba = g_colors[i];
  //     // var size = g_sizes[i];

  //     // Pass the texture number
  //     gl.uniform1i(u_whichTexture, this.textureNum);      
  //     // gl.uniform1i(u_whichTexture, -2);      
  
  //     // Pass the position of a point to a_Position variable
  //     // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0); // dont need this (from Point class) b/c for triangle we're using vertexAttribPointer
  //     // Pass the color of a point to u_FragColor variable
  //     gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); // 4f means 4 floating point vals
      
  //     // Pass the matrix to u_ModelMatrix attribute before drawing the cube
  //     gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

  //     var allverts = [];

  //     // Front of cube
  //     // drawTriangle3D( [0, 0, 0,  1, 1, 0,  1, 0, 0] );
  //     // vertex pos 1         2        3      1       2       3 uv coords for each vertices 
  //     // drawTriangle3DUV( [0, 0, 0,  1, 1, 0,  1, 0, 0], [1, 0,  0, 1,  1, 1] );
      
  //     // instead of calling drawTriangle, take the array of vertices and add them to a single list
  //     allverts = allverts.concat( [0, 0, 0,  1, 1, 0,  1, 0, 0] );
  //     allverts = allverts.concat( [0, 0, 0,  0, 1, 0,  1, 1, 0] );
  //     // drawTriangle3D( [0, 0, 0,  0, 1, 0,  1, 1, 0] );

  //     // Add fake Lighting (differnt amount of light bouncing off each surface). Pass the color of a point to u_FragColor uniform variable
  //     // gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
  //     // for more sides, they might multiply by a slightly diff num, like 0.8

  //     // Top of cube
  //     allverts = allverts.concat( [0, 1, 0,  0, 1, 1,  1, 1, 1] );
  //     allverts = allverts.concat( [0, 1, 0,  1, 1, 1,  1, 1, 0] );

  //     // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

  //     // Bottom of cube
  //     // allverts = allverts.concat( [0, 0, 0,  1, 0, 0,  0, 0, 1] );
  //     // allverts = allverts.concat( [1, 0, 0,  1, 0, 1,  0, 0, 1] );
  //     allverts = allverts.concat( [0, 0, 0,  0, 0, 1,  1, 0, 1] );
  //     allverts = allverts.concat( [0, 0, 0,  1, 0, 1,  1, 0, 0] );

  //     // gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);

  //     // Left of cube
  //     // allverts = allverts.concat( [0, 0, 0,  0, 1, 0,  0, 0, 1] );
  //     // allverts = allverts.concat( [0, 1, 0,  0, 1, 1,  0, 0, 1] );
  //     allverts = allverts.concat( [0, 1, 0,  0, 1, 1,  0, 0, 0] );
  //     allverts = allverts.concat( [0, 0, 0,  0, 1, 1,  0, 0, 1] );

  //     // Right of cube
  //     // allverts = allverts.concat( [1, 0, 0,  1, 0, 1,  1, 1, 0] );
  //     // allverts = allverts.concat( [1, 1, 0,  1, 0, 1,  1, 1, 1] );
  //     allverts = allverts.concat( [1, 1, 0,  1, 1, 1,  1, 0, 0] );
  //     allverts = allverts.concat( [1, 0, 0,  1, 1, 1,  1, 0, 1] );
      
  //     // gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
  //     // Back of cube
  //     // allverts = allverts.concat( [0, 0, 1,  1, 0, 1,  1, 1, 1] );
  //     // allverts = allverts.concat( [0, 0, 1,  1, 1, 1,  0, 1, 1] );
  //     allverts = allverts.concat( [0, 0, 1,  1, 1, 1,  1, 0, 1] );
  //     allverts = allverts.concat( [0, 0, 1,  0, 1, 1,  1, 1, 1] );

  //     drawTriangle3D(allverts);

  // }
    
  // renderfaster() {
  //   // var xy = this.position;
  //   var rgba = this.color;

  //   // Pass the texture number
  //   gl.uniform1i(u_whichTexture, this.textureNum);      

  //   // Pass the position of a point to a_Position variable
  //   // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0); // dont need this (from Point class) b/c for triangle we're using vertexAttribPointer
  //   // Pass the color of a point to u_FragColor variable
  //   gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); // 4f means 4 floating point vals
    
  //   // Pass the matrix to u_ModelMatrix attribute before drawing the cube
  //   gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
  //   // drawTriangle3D(this.cubeVerts, this.cubeUVs);
  //   drawTriangle3D();

  //   // if (g_vertexBuffer == null) {
  //   //   initTriangle3D();
  //   // }
  //   // Write data into the buffer object
  //   // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.cubeVerts), gl.DYNAMIC_DRAW); // data coming as JS array, so convert it to Float32Array before giving it to GLSL
  //   // gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW); // data coming as JS array, so convert it to Float32Array before giving it to GLSL
  //   // gl.bufferData(gl.ARRAY_BUFFER, this.cubeUVs32, gl.DYNAMIC_DRAW); // data coming as JS array, so convert it to Float32Array before giving it to GLSL
  
  //   // gl.drawArrays(gl.TRIANGLE, 0, 36);

  // }
}