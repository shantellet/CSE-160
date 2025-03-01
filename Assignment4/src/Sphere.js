function sin(x) {
  return Math.sin(x);
}

function cos(x) {
  return Math.cos(x);
}

class Sphere {
    constructor() {
      this.type = "Sphere";
      // this.position = [0.0, 0.0, 0.0, 0.0];
      this.color = [0.8, 0.7, 0.5, 1.0];
      // this.size = 5.0;
      // this.segments = 10;
      this.matrix = new Matrix4();
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
      // this.cubeVerts = [
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
      // ];
      // this.cubeUVs = [
      //   0, 0,  1, 1,  1, 0, // front
      //   0, 0,  0, 1,  1, 1,
      //   0, 0,  0, 1,  1, 1, // top
      //   0, 0,  1, 1,  1, 0,
      //   0, 0,  1, 0,  0, 1, // bottom
      //   1, 0,  1, 1,  0, 1,
      //   0, 0,  0, 1,  1, 0, // left
      //   0, 1,  1, 1,  1, 0,
      //   0, 0,  0, 1,  1, 0, // right
      //   1, 0,  0, 1,  1, 1,
      //   0, 0,  1, 0,  1, 1, // back
      //   0, 0,  1, 1,  0, 1
      // ];
    }
    
    render() {
      // var xy = this.position;
      var rgba = this.color;
      // var size = this.size;
      // var xy = g_points[i];
      // var rgba = g_colors[i];
      // var size = g_sizes[i];

      // Pass the texture number
      gl.uniform1i(u_whichTexture, this.textureNum);
  
      // Pass the position of a point to a_Position variable
      // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0); // dont need this (from Point class) b/c for triangle we're using vertexAttribPointer
      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); // 4f means 4 floating point vals
      
      // Pass the matrix to u_ModelMatrix attribute before drawing the cube
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);



      // spherical coordinate system

      var d = Math.PI / 25;
      var dd = Math.PI / 25; // full sphere

      for (var t = 0; t < Math.PI; t += d) { // 1 to 180 deg
        for (var r = 0; r < (2 * Math.PI); r += d) { // 1 to 360 deg
          var p1 = [sin(t) * cos(r), sin(t) * sin(r), cos(t)];

          var p2 = [sin(t + dd) * cos(r), sin(t + dd) * sin(r), cos(t + dd)];
          var p3 = [sin(t) * cos(r + dd), sin(t) * sin(r + dd), cos(t)];
          var p4 = [sin(t + dd) * cos(r + dd), sin(t + dd) * sin(r + dd), cos(t + dd)];

          var uv1 = [t / Math.PI, r / (2 * Math.PI)];
          var uv2 = [(t + dd) / Math.PI, r / (2 * Math.PI)];
          var uv3 = [t / Math.PI, (r + dd) / (2 * Math.PI)];
          var uv4 = [(t + dd) / Math.PI, (r + dd) / (2 * Math.PI)];

          var v = [];
          var uv = [];
          // v = v.concat(p1); uv = uv.concat([0, 0]);
          // v = v.concat(p2); uv = uv.concat([0, 0]);
          // v = v.concat(p4); uv = uv.concat([0, 0]);
          v = v.concat(p1); uv = uv.concat(uv1);
          v = v.concat(p2); uv = uv.concat(uv2);
          v = v.concat(p4); uv = uv.concat(uv4);

          gl.uniform4f(u_FragColor, 1, 1, 1, 1);
          drawTriangle3DUVNormal(v, uv, v);

          v = []; uv = [];
          // v = v.concat(p1); uv = uv.concat([0, 0]);
          // v = v.concat(p4); uv = uv.concat([0, 0]);
          // v = v.concat(p3); uv = uv.concat([0, 0]);
          v = v.concat(p1); uv = uv.concat(uv1);
          v = v.concat(p4); uv = uv.concat(uv4);
          v = v.concat(p3); uv = uv.concat(uv3);
          gl.uniform4f(u_FragColor, 1, 0, 0, 1);
          drawTriangle3DUVNormal(v, uv, v);
        }
      }
    }
}