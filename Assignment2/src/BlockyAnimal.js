// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program


var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix; // add a matrix so we can use it to change where our cube shows up on the screen
  uniform mat4 u_GlobalRotateMatrix; // add a slider that lets us rotate the animal around so we can it from all sides. eventually will be a camera action. simulating a camera
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
// UI elements or data we have to pass from JS to GLSL (which we know we'll only have 1 copy)
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true}); // tells GLContext which buffers to preserve rather than reallocating and clearing them in between. this enhances the performance
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST); // depth buffer keeps track of what is in front of something else. takes care of the "transparency bug" the cube sides
}

function connectVariablesToGLSL() {
    // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  
  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  
  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const STAR = 3;
const DRAWING = 4;
const RANDOM = 5;

let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedNumSegments = 10;
let g_selectedNumPoints = 5;
let g_globalAngle = 0;

// Set up actions for the HTML UI elements (how to deal with the buttons)
function addActionsForHtmlUI() {
  // Button Events (Shape Type)
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderScene(); }; // clear g_shapesList

  document.getElementById('pointButton').onclick = function() { g_selectedType = POINT };
  document.getElementById('triButton').onclick = function() { g_selectedType = TRIANGLE };
  document.getElementById('circleButton').onclick = function() { g_selectedType = CIRCLE };
  document.getElementById('starButton').onclick = function() { g_selectedType = STAR };
  document.getElementById('pictureButton').onclick = function() { g_selectedType = DRAWING };
  document.getElementById('randomButton').onclick = function() { g_selectedType = RANDOM };

  // Slider Events
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value / 100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value / 100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value / 100; });
  
  // Size Slider Events
  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
  document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_selectedNumSegments = this.value; });
  document.getElementById('pointsSlide').addEventListener('mouseup', function() { g_selectedNumPoints = this.value; });

  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderScene(); });

  document.getElementById('pictureButton').onclick = function() { drawPicture(); };
}

// draw a picture of a rabbit using triangles of random colors
function drawPicture() {
  // A = (-0.27, 0.324)
  // B = (-0.374, 0.226)
  // C = (-0.267, 0.128)
  // D = (-0.12, 0.358)
  // E = (-0.035, 0.674)
  // F = (0.048, 0.742)
  // G = (0.062, 0.638)
  // H = (-0.096, 0.273)
  // I = (0.2, 0.624)
  // J = (-0.057, 0.165)
  // K = (-0.221, -0.015)
  // L = (0, 0.004)
  // M = (0.323, 0.03)
  // N = (-0.148, -0.116)
  // O = (0.399, -0.176)
  // P = (-0.141, -0.201)
  // Q = (0.366, -0.398)
  // R = (0.428, -0.283)
  // S = (0.009, -0.133)
  // T = (0.129, -0.282)
  // U = (-0.176, -0.402)
  // V = (-0.069, -0.358)
  // W = (-0.18, -0.358)
  // Z = (-0.25, -0.24)
  // A_1 = (-0.207, -0.275)
  // B_1 = (0.26, -0.232)
  // the triangles compose of those points: 
  // ABJ, ADJ, BCJ, CJK, DEH, EFG, EGH, GHI, JKL, JLM, KMN, MNO, NPS, NPZ, ORQ, OST, OQB_1, PST, PZA_1, QUB_1, UVW
  // triangles in form of arrays with 6 elements made of the vertex coordinates, with commas separating the arrays
      
  // define triangle vertices
  const triangles = [
    [-0.27, 0.324, -0.374, 0.226, -0.057, 0.165], // ABJ
    [-0.27, 0.324, -0.12, 0.358, -0.057, 0.165], // ADJ
    [-0.374, 0.226, -0.267, 0.128, -0.057, 0.165], // BCJ
    [-0.267, 0.128, -0.057, 0.165, -0.221, -0.015], // CJK
    [-0.035, 0.674, -0.096, 0.273, -0.12, 0.358], // DEH
    [-0.035, 0.674, 0.048, 0.742, 0.062, 0.638], // EFG
    [-0.035, 0.674, 0.062, 0.638, -0.096, 0.273], // EGH
    [0.062, 0.638, -0.096, 0.273, 0.2, 0.624], // GHI
    [-0.057, 0.165, -0.221, -0.015, 0, 0.004], // JKL
    [-0.057, 0.165, 0, 0.004, 0.323, 0.03], // JLM
    [-0.221, -0.015, -0.148, -0.116, 0.323, 0.03], // KMN
    [0.323, 0.03, 0.399, -0.176, -0.148, -0.116], // MNO
    [-0.148, -0.116, -0.141, -0.201, 0.009, -0.133], // NPS
    [-0.148, -0.116, -0.25, -0.24, -0.141, -0.201], // NPZ
    [0.399, -0.176, 0.366, -0.398, 0.428, -0.283], // ORQ
    [0.399, -0.176, 0.009, -0.133, 0.129, -0.282], // OST
    [0.399, -0.176, 0.366, -0.398, 0.26, -0.232], // OQB_1
    [-0.141, -0.201, 0.009, -0.133, 0.129, -0.282], // PST
    [-0.141, -0.201, -0.25, -0.24, -0.207, -0.275], // PZA_1
    [0.366, -0.398, -0.176, -0.402, 0.26, -0.232], // QUB_1
    [-0.176, -0.402, -0.069, -0.358, -0.18, -0.358] // UVW
  ];
  
  const size = 1.0; // filler size (just for shader so it works)
  
  gl.uniform1f(u_Size, size);

  // 1 random color for the entire drawing
  // const color = [Math.random(), Math.random(), Math.random(), 1.0];
  // gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  
  // random color for each of the triangles
  for (const triangle of triangles) {
    const color = [Math.random(), Math.random(), Math.random(), 1.0];
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
    drawTriangle(triangle);
  }
}

function main() {

  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();
  
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) } }; // want to draw when move mouse with mouse pressed

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);

  // Render
  renderScene(); // instead of clearing the canvas and waiting for a click, now going to render all shapes at the end of the canvas
}

var g_shapesList = []; // list of points

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = []; // the array to store the size of a point

function click(ev) {

  // Extract the event click and return it in WebGL coordinates
  let [x, y] = convertCoordinatesEventToGL(ev);

  // Create and store the new point
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  }
  else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  }
  else if (g_selectedType == CIRCLE) {
    point = new Circle();
    point.segments = g_selectedNumSegments;
  }
  // Awesomeness: create a new shape, star
  else if (g_selectedType == STAR) {
    point = new Star();
    point.points = g_selectedNumPoints;
  }
  // Awesomeness: create a random shape
  else if (g_selectedType == RANDOM) {
    const shapes = [POINT, CIRCLE, TRIANGLE, STAR];
    let choice = shapes[Math.floor(Math.random() * shapes.length)];
    if (choice == POINT) {
      point = new Point();
    }
    else if (choice == TRIANGLE) {
      point = new Triangle();
    }
    else if (choice == CIRCLE) {
      point = new Circle();
      point.segments = g_selectedNumSegments;
    }
    else if (choice == STAR) {
      point = new Star();
      point.points = g_selectedNumPoints;
    }
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;

  // give the random shape random position, color, size, etc. as well
  if (g_selectedType == RANDOM) {
    point.position = [Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0]; // random nums between -1 and 1
    point.color = [Math.random(), Math.random(), Math.random(), 1.0];
    point.size = Math.random() * 35.0 + 5.0;
    if (point.type == "circle") {
      point.segments = Math.floor(Math.random() * 90 + 10);
    }
    else if (point.type == "star") {
      point.points = Math.floor(Math.random() * 3 + 5);
    }
  }

  g_shapesList.push(point);
  
  // Draw every shape that is supposed to be in the canvas
  renderScene();
}

// Extract the event click adn return it in WebGL coordinates
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x, y]);
}

// Draw every shape that is supposed to be in the canvas
function renderScene() {

  // Check the time at the start of this function
  var startTime = performance.now();

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0); // what we get from slider is just an angle, so we're going to use a matrix and call rotate to turn this angle into an actual matrix
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements); // pass elements to the matrix

  // Clear <canvas>
  // clear the DEPTH_BUFFER when you clear your screen
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // var len = g_points.length; // no guarantee that the g_points list is the same length as the colors or size list
  // var len = g_shapesList.length;

  // for(var i = 0; i < len; i++) {
  //   g_shapesList[i].render();
  // }

  // Draw a test triangle
  // drawTriangle3D( [-1.0, 0.0, 0.0,  -0.5, -1.0, 0.0,  0.0, 0.0, 0.0] );
  
  // Draw the body cube
  // didnt define a cube function (u could do that) (instead using a class cube here)
  var body = new Cube(); // body of animal
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.matrix.setTranslate(-0.25, -0.75, 0.0); // use setTranslate instead of translate because translate assumes we start with an identity matrix
  body.matrix.rotate(-5, 1, 0, 0);
  body.matrix.scale(0.5, 0.3, 0.5);
  // remember these happen in reverse order because these are right multiplies. we started with identity matrix, right multiply a setTranslate, then right multiply a scale. so scale is happening first, then translate
  body.render();

  // Draw a left arm
  var leftArm = new Cube();
  leftArm.color = [1, 1, 0, 1];
  leftArm.matrix.translate(0, -0.5, 0.0);
  leftArm.matrix.rotate(-5, 1, 0, 0);
  leftArm.matrix.rotate(0, 0, 0, 1);
  leftArm.matrix.scale(0.25, 0.7, 0.5);
  leftArm.matrix.translate(-0.5, 0, 0);
  leftArm.render();

  // Test box
  var box = new Cube();
  box.color = [1, 0, 1, 1];
  box.matrix.translate(-0.1, 0.1, 0, 0);
  box.matrix.rotate(-30, 1, 0, 0);
  box.matrix.scale(0.2, 0.4, 0.2);
  box.render();

  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}