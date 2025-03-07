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
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
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

let g_selectedColor = [1.0,1.0,1.0,1.0];

let g_xGlobalAngle = -35;
let g_yGlobalAngle = 0;
// let g_zGlobalAngle = 0;

let g_earAngle = 0;
let g_frontLeg1Angle = 0;
let g_frontLeg2Angle = 0;
let g_backLeg1Angle = 0;
let g_backLeg2Angle = 0;
let g_neckAngle = 0;
// let g_yellowAngle = 0
// let g_magentaAngle = 0;
let g_tailAngle = 0;

let g_earAnimation = false;
let g_frontLeg1Animation = false;
let g_frontLeg2Animation = false;
let g_neckAnimation = false;
let g_backLeg1Animation = false;
let g_backLeg2Animation = false;
// let g_tailAnimation = false;
// let g_yellowAnimation = true;
// let g_magentaAnimation = true;
let g_animation = true;
let shift = false;

// Set up actions for the HTML UI elements (how to deal with the buttons)
function addActionsForHtmlUI() {
  document.getElementById('animationOffButton').onclick = function() { g_animation = false; };
  document.getElementById('animationOnButton').onclick = function() { g_animation = true; };
  // document.getElementById('animationYellowOffButton').onclick = function() { g_yellowAnimation = false; };
  // document.getElementById('animationYellowOnButton').onclick = function() { g_yellowAnimation = true; };

  // document.getElementById('animationMagentaOffButton').onclick = function() { g_magentaAnimation = false; };
  // document.getElementById('animationMagentaOnButton').onclick = function() { g_magentaAnimation = true; }

  // document.getElementById('magentaSlide').addEventListener('mousemove', function() { g_magentaAngle = this.value; renderScene(); });
  // document.getElementById('yellowSlide').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderScene(); });

  document.getElementById('xAngleSlide').addEventListener('mousemove', function() { g_xGlobalAngle = parseInt(this.value); renderScene(); });
  document.getElementById('yAngleSlide').addEventListener('mousemove', function() { g_yGlobalAngle = parseInt(this.value); renderScene(); });
  // document.getElementById('zAngleSlide').addEventListener('input', function() { g_zGlobalAngle = this.value; renderScene(); });

  canvas.onmousedown = startDragging;
  canvas.onmouseup = stopDragging;
  canvas.onmousemove = handleDragging;

}

let dragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

function startDragging(ev) {
  if (ev.shiftKey && !shift) {
    shift = true;
  }
  else if (ev.shiftKey && shift) {
    shift = false;
  }
  if (ev.target === canvas) {
    dragging = true;
    lastMouseX = ev.clientX;
    lastMouseY = ev.clientY;
  }
}

function stopDragging(ev) {
  if (dragging && ev.target == canvas) {
    dragging = false;
  }
}


function handleDragging(ev) {
    let newX = ev.clientX;
    let newY = ev.clientY;
    if (dragging) {
      let deltaX = newX - lastMouseX;
      let deltaY = newY - lastMouseY;

      g_xGlobalAngle += deltaX;
      g_yGlobalAngle += deltaY;
      document.getElementById('xAngleSlide').value = g_xGlobalAngle;
      document.getElementById('yAngleSlide').value = g_yGlobalAngle;

      renderScene();
    }
    lastMouseX = newX;
    lastMouseY = newY;
}

function main() {

  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();
  
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  // canvas.onmousedown = click;
  // canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) } }; // want to draw when move mouse with mouse pressed

  // Specify the color for clearing <canvas>
  gl.clearColor(0.6, 0.8, 1.0, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);

  // Render
  // renderScene(); // instead of clearing the canvas and waiting for a click, now going to render all shapes at the end of the canvas
  requestAnimationFrame(tick); // requet the initial animation frame at the beginning of main, which will get everything started. now this will run automatically.
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

// Called by browser repeatedly whenever it's time
function tick() {
  // Save the current time
  g_seconds = performance.now() / 1000.0 - g_startTime;
  // console.log(g_seconds);

  // Update Animation Angles
  updateAnimationAngles();

  // // Print some debug info so we know we are running
  // console.log(performance.now());

  // Draw everything
  renderScene();

  // Tell the browser to update again when it has time (when to call myself (me, a function) again)
  requestAnimationFrame(tick);
}

// Update the angles of everything if currently animated
function updateAnimationAngles() {
  if (g_animation) {
    g_earAngle = (10*Math.cos(3*g_seconds));
    g_frontLeg1Angle = (20*Math.sin(3*g_seconds+0.7));
    g_frontLeg2Angle = (20*Math.sin(3*g_seconds));
    g_neckAngle = (5*Math.sin(3*g_seconds));
    g_backLeg1Angle = (20*Math.cos(3*g_seconds+0.7));
    g_backLeg2Angle = (20*Math.cos(3*g_seconds));
    // g_tailAngle = (40*Math.sin(4*g_seconds));
  }
  // if (g_earAnimation) {
  //   g_earAngle = (10*Math.cos(3*g_seconds));
  // }
  // if (g_frontLeg1Animation) {
  //   g_frontLeg1Angle = (20*Math.sin(3*g_seconds+0.7));
  // }
  // if (g_frontLeg2Animation) {
  //   g_frontLeg2Angle = (20*Math.sin(3*g_seconds));
  // }
  // if (g_neckAnimation) {
  //   g_neckAngle = (5*Math.sin(3*g_seconds));
  // }
  // if (g_backLeg1Animation) {
  //   g_backLeg1Angle = (20*Math.cos(3*g_seconds+0.7));
  // }
  // if (g_backLeg2Animation) {
  //   g_backLeg2Angle = (20*Math.cos(3*g_seconds));
  // }
  if (shift) {
    g_tailAngle = (40*Math.sin(4*g_seconds));
  }
}

var g_shapesList = []; // list of points

function click(ev) {

  // Extract the event click and return it in WebGL coordinates
  // let [x, y] = convertCoordinatesEventToGL(ev);

  // Create and store the new point
  // let point;
  // point.position = [x, y];
  
  // Draw every shape that is supposed to be in the canvas
  // renderScene();
}

// Extract the event click adn return it in WebGL coordinates
// function convertCoordinatesEventToGL(ev) {
//   var x = ev.clientX; // x coordinate of a mouse pointer
//   var y = ev.clientY; // y coordinate of a mouse pointer
//   var rect = ev.target.getBoundingClientRect();

//   x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
//   y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

//   return ([x, y]);
// }

// Draw every shape that is supposed to be in the canvas
function renderScene() {

  // Check the time at the start of this function
  var startTime = performance.now();

  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_xGlobalAngle, 0, 1, 0);
  globalRotMat.rotate(g_yGlobalAngle, 1, 0, 0);
  // globalRotMat.rotate(g_zGlobalAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // // Pass the matrix to u_ModelMatrix attribute
  // var globalXRotMat = new Matrix4().rotate(g_xGlobalAngle, 0, 1, 0); // what we get from slider is just an angle, so we're going to use a matrix and call rotate to turn this angle into an actual matrix
  // var globalYRotMat = new Matrix4().rotate(g_yGlobalAngle, 1, 0, 0); // what we get from slider is just an angle, so we're going to use a matrix and call rotate to turn this angle into an actual matrix
  
  // var combinedRotMat = globalXRotMat.multiply(globalYRotMat);
  // gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, combinedRotMat.elements); // pass elements to the matrix

  // gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalXRotMat.elements); // pass elements to the matrix

  // gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalYRotMat.elements); // pass elements to the matrix

  // Clear <canvas>
  // clear the DEPTH_BUFFER when you clear your screen
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  var body = new Cube(); // body of animal
  // body.color = [1, 1, 0, 1];
  body.matrix.setTranslate(-0.4, -0.3, 0.0); // use setTranslate instead of translate because translate assumes we start with an identity matrix
  body.matrix.rotate(0, 1, 0, 0);
  body.matrix.scale(1, 0.5, 0.5);
  body.matrix.translate(0, 0, 0.001);
  // remember these happen in reverse order because these are right multiplies. we started with identity matrix, right multiply a setTranslate, then right multiply a scale. so scale is happening first, then translate
  body.render();

  // var thigh1 = new Cube(); // thigh1 of animal
  // thigh1.color = [1, 0, 0, 1];
  // thigh1.matrix.setTranslate(-0.4, -0.3, 0); // use setTranslate instead of translate because translate assumes we start with an identity matrix
  // thigh1.matrix.rotate(g_thigh1Angle, 1, 0, 0);
  // var thigh1CoordinatesMat = new Matrix4(thigh1.matrix);
  // thigh1.matrix.scale(0.15, -0.3, 0.5);
  // // thigh1.matrix.translate(-0.5, -0.5, -0.3); // use setTranslate instead of translate because translate assumes we start with an identity matrix
  // // remember these happen in reverse order because these are right multiplies. we started with identity matrix, right multiply a setTranslate, then right multiply a scale. so scale is happening first, then translate
  // thigh1.render();

  // var calf1 = new Cube(); // calf1 of animal
  // calf1.color = [1, 1, 1, 1];
  // calf1.matrix = thigh1CoordinatesMat;
  // calf1.matrix.setTranslate(-0.5, -0.5, -0.3); // use setTranslate instead of translate because translate assumes we start with an identity matrix
  // calf1.matrix.rotate(0, 1, 0, 0);
  // calf1.matrix.scale(0.15, 0.3, 0.5);
  // // remember these happen in reverse order because these are right multiplies. we started with identity matrix, right multiply a setTranslate, then right multiply a scale. so scale is happening first, then translate
  // calf1.render();

  // var foot1 = new Cube(); // foot1 of animal
  // foot1.color = [1, 1, 0, 1];
  // foot1.matrix.setTranslate(-0.5, -0.9, -0.3); // use setTranslate instead of translate because translate assumes we start with an identity matrix
  // foot1.matrix.rotate(0, 1, 0, 0);
  // foot1.matrix.scale(0.15, 0.3, 0.5);
  // // remember these happen in reverse order because these are right multiplies. we started with identity matrix, right multiply a setTranslate, then right multiply a scale. so scale is happening first, then translate
  // foot1.render();

  // neck
  var neck = new Cube();
  // neck.color = [1, 1, 0, 1];
  neck.matrix.translate(-0.5, 0, 0.1);
  neck.matrix.rotate(-45, 0, 0, 1);
  neck.matrix.rotate(g_neckAngle, 0, 0, 1);
  var neckCoordinatesMat = new Matrix4(neck.matrix); // store an intermediate matrix. the below scale and translate are for the size while the above are about moving the box. but even with this, the next box is still getting the scaling. this is bc javascript passes by pointer for complex objects, unless u do something otherwise. so to force it to make a copy, create a new matrix
  neck.matrix.scale(0.3, 0.3, 0.3);
  neck.matrix.translate(-0.5, 0, 0);
  neck.render();

  // head
  var head = new Cube();
  // head.color = [1, 0, 1, 1];
  head.matrix = neckCoordinatesMat; // use leftArm coordinate system as the starting coordinate system for this cube
  head.matrix.rotate(45, 0, 0, 1);
  head.matrix.translate(-0.2, 0, -0.001);
  // head.matrix.rotate(30+g_leg1Angle, 0, 0, 1);
  var headCoordinatesMat = new Matrix4(head.matrix);
  head.matrix.scale(0.3, 0.3, 0.3);
  head.matrix.translate(0, 0, -0.0001);
  // head.matrix.translate(-0.5, 0.0, -0.0001); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  head.render();

  // ear1
  var ear1 = new Pyramid();
  ear1.color = [0.5, 0.3, 0.2, 1];
  ear1.matrix.set(headCoordinatesMat); // use IDENTITY MATRIX to apply translations and rotations but NOT scaling // fixes the problem with the weird cube next to the pyramid
  ear1.matrix.translate(0.1, 0.25, 0.15);
  ear1.matrix.rotate(g_earAngle, 0, 0, 1);
  ear1.matrix.rotate(-90, 1, 0, 0);
  // ear1.matrix.rotate(-30+g_leg1Angle, 0, 0, 1);
  ear1.matrix.scale(0.15, 0.15, 0.3);
  ear1.matrix.translate(-0.4, 0.0, -0.0002); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  ear1.render();

   // ear2
  var ear2 = new Pyramid();
  ear2.color = [0.5, 0.3, 0.2, 1];
  ear2.matrix.set(headCoordinatesMat); // use IDENTITY MATRIX to apply translations and rotations but NOT scaling // fixes the problem with the weird cube next to the pyramid
  ear2.matrix.translate(0.1, 0.25, 0.3);
  ear2.matrix.rotate(g_earAngle, 0, 0, 1);
  ear2.matrix.rotate(-90, 1, 0, 0);
  // ear2.matrix.rotate(-30+g_leg1Angle, 0, 0, 1);
  ear2.matrix.scale(0.15, 0.15, 0.3);
  ear2.matrix.translate(-0.4, 0.0, -0.0002); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  ear2.render();

  // snout
  var snout = new Cube();
  snout.color = [0.5, 0.3, 0.2, 1];
  snout.matrix = headCoordinatesMat; // use leftArm coordinate system as the starting coordinate system for this cube
  snout.matrix.translate(-0.12, 0, 0);
  // snout.matrix.rotate(90, 0, 0, 1);
  // snout.matrix.rotate(-30+g_leg1Angle, 0, 0, 1);
  snout.matrix.scale(0.2, 0.16, 0.3);
  snout.matrix.translate(-0.4, 0.0, -0.0002); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  snout.render();



  // want a function that lets us update the state of the angles but does not immediately flash back to the last thing on the slider
  // frontThigh1
  var frontThigh1 = new Cube();
  // frontThigh1.color = [1, 1, 0, 1];
  frontThigh1.matrix.translate(-0.2, 0, 0.01);
  // frontThigh1.matrix.rotate(-5, 1, 0, 0);
  frontThigh1.matrix.rotate(g_frontLeg1Angle, 0, 0, 1);
  var frontThigh1CoordinatesMat = new Matrix4(frontThigh1.matrix); // store an intermediate matrix. the below scale and translate are for the size while the above are about moving the box. but even with this, the next box is still getting the scaling. this is bc javascript passes by pointer for complex objects, unless u do something otherwise. so to force it to make a copy, create a new matrix
  frontThigh1.matrix.scale(0.08, -0.5, 0.22);
  frontThigh1.matrix.translate(-0.5, 0, 0);
  frontThigh1.render();

  // frontCalf1
  var frontCalf1 = new Cube();
  // frontCalf1.color = [1, 0, 1, 1];
  frontCalf1.matrix = frontThigh1CoordinatesMat; // use leftArm coordinate system as the starting coordinate system for this cube
  frontCalf1.matrix.translate(0, -0.45, 0);
  frontCalf1.matrix.rotate(30+g_frontLeg1Angle, 0, 0, 1);
  var frontCalf1CoordinatesMat = new Matrix4(frontCalf1.matrix);
  frontCalf1.matrix.scale(0.08, -0.3, 0.22);
  frontCalf1.matrix.translate(-0.5, 0.0, -0.0001); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  frontCalf1.render();

  // frontFoot1
  var frontFoot1 = new Cube();
  frontFoot1.color = [0.5, 0.3, 0.2, 1];
  frontFoot1.matrix = frontCalf1CoordinatesMat; // use leftArm coordinate system as the starting coordinate system for this cube
  frontFoot1.matrix.translate(-0.07, -0.32, 0);
  frontFoot1.matrix.rotate(90, 0, 0, 1);
  frontFoot1.matrix.rotate(-40+g_frontLeg1Angle, 0, 0, 1);
  frontFoot1.matrix.scale(0.2, -0.1, 0.22);
  frontFoot1.matrix.translate(-0.5, 0.0, -0.0002); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  frontFoot1.render();
  


  // frontThigh2
  var frontThigh2 = new Cube();
  // frontThigh2.color = [1, 1, 0, 1];
  frontThigh2.matrix.translate(-0.2, 0, 0.27);
  // frontThigh2.matrix.rotate(-5, 1, 0, 0);
  frontThigh2.matrix.rotate(g_frontLeg2Angle, 0, 0, 1);
  var frontThigh2CoordinatesMat = new Matrix4(frontThigh2.matrix); // store an intermediate matrix. the below scale and translate are for the size while the above are about moving the box. but even with this, the next box is still getting the scaling. this is bc javascript passes by pointer for complex objects, unless u do something otherwise. so to force it to make a copy, create a new matrix
  frontThigh2.matrix.scale(0.08, -0.5, 0.22);
  frontThigh2.matrix.translate(-0.5, 0, 0);
  frontThigh2.render();

  // frontCalf2
  var frontCalf2 = new Cube();
  // frontCalf2.color = [1, 0, 1, 1];
  frontCalf2.matrix = frontThigh2CoordinatesMat; // use leftArm coordinate system as the starting coordinate system for this cube
  frontCalf2.matrix.translate(0, -0.45, 0);
  frontCalf2.matrix.rotate(30+g_frontLeg2Angle, 0, 0, 1);
  var frontCalf2CoordinatesMat = new Matrix4(frontCalf2.matrix);
  frontCalf2.matrix.scale(0.08, -0.3, 0.22);
  frontCalf2.matrix.translate(-0.5, 0.0, -0.0001); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  frontCalf2.render();

  // frontFoot2
  var frontFoot2 = new Cube();
  frontFoot2.color = [0.5, 0.3, 0.2, 1];
  frontFoot2.matrix = frontCalf2CoordinatesMat; // use leftArm coordinate system as the starting coordinate system for this cube
  frontFoot2.matrix.translate(-0.07, -0.32, 0);
  frontFoot2.matrix.rotate(90, 0, 0, 1);
  frontFoot2.matrix.rotate(-40+g_frontLeg2Angle, 0, 0, 1);
  frontFoot2.matrix.scale(0.2, -0.1, 0.22);
  frontFoot2.matrix.translate(-0.5, 0.0, -0.0002); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  frontFoot2.render();



  // backThigh1
  var backThigh1 = new Cube();
  // backThigh1.color = [1, 1, 0, 1];
  backThigh1.matrix.translate(0.4, 0, 0.0);
  // backThigh1.matrix.rotate(-5, 1, 0, 0);
  backThigh1.matrix.rotate(g_backLeg1Angle, 0, 0, 1);
  var backThigh1CoordinatesMat = new Matrix4(backThigh1.matrix); // store an intermediate matrix. the below scale and translate are for the size while the above are about moving the box. but even with this, the next box is still getting the scaling. this is bc javascript passes by pointer for complex objects, unless u do something otherwise. so to force it to make a copy, create a new matrix
  backThigh1.matrix.scale(0.08, -0.5, 0.22);
  backThigh1.matrix.translate(-0.5, 0, 0);
  backThigh1.render();

  // backCalf1
  var backCalf1 = new Cube();
  // backCalf1.color = [1, 0, 1, 1];
  backCalf1.matrix = backThigh1CoordinatesMat; // use leftArm coordinate system as the starting coordinate system for this cube
  backCalf1.matrix.translate(0, -0.45, 0);
  backCalf1.matrix.rotate(30+g_backLeg1Angle, 0, 0, 1);
  var backCalf1CoordinatesMat = new Matrix4(backCalf1.matrix);
  backCalf1.matrix.scale(0.08, -0.3, 0.22);
  backCalf1.matrix.translate(-0.5, 0.0, -0.0001); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  backCalf1.render();

  // backFoot1
  var backFoot1 = new Cube();
  backFoot1.color = [0.5, 0.3, 0.2, 1];
  backFoot1.matrix = backCalf1CoordinatesMat; // use leftArm coordinate system as the starting coordinate system for this cube
  backFoot1.matrix.translate(-0.07, -0.32, 0);
  backFoot1.matrix.rotate(90, 0, 0, 1);
  backFoot1.matrix.rotate(-40+g_backLeg1Angle, 0, 0, 1);
  backFoot1.matrix.scale(0.2, -0.1, 0.22);
  backFoot1.matrix.translate(-0.5, 0.0, -0.0002); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  backFoot1.render();



  // backThigh2
  var backThigh2 = new Cube();
  // backThigh2.color = [1, 1, 0, 1];
  backThigh2.matrix.translate(0.4, 0, 0.27);
  // backThigh2.matrix.rotate(-5, 1, 0, 0);
  backThigh2.matrix.rotate(g_backLeg2Angle, 0, 0, 1);
  var backThigh2CoordinatesMat = new Matrix4(backThigh2.matrix); // store an intermediate matrix. the below scale and translate are for the size while the above are about moving the box. but even with this, the next box is still getting the scaling. this is bc javascript passes by pointer for complex objects, unless u do something otherwise. so to force it to make a copy, create a new matrix
  backThigh2.matrix.scale(0.08, -0.5, 0.22);
  backThigh2.matrix.translate(-0.5, 0, 0);
  backThigh2.render();

  // backCalf2
  var backCalf2 = new Cube();
  // backCalf2.color = [1, 0, 1, 1];
  backCalf2.matrix = backThigh2CoordinatesMat; // use leftArm coordinate system as the starting coordinate system for this cube
  backCalf2.matrix.translate(0, -0.45, 0);
  backCalf2.matrix.rotate(30+g_backLeg2Angle, 0, 0, 1);
  var backCalf2CoordinatesMat = new Matrix4(backCalf2.matrix);
  backCalf2.matrix.scale(0.08, -0.3, 0.22);
  backCalf2.matrix.translate(-0.5, 0.0, -0.0001); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  backCalf2.render();

  // backFoot2
  var backFoot2 = new Cube();
  backFoot2.color = [0.5, 0.3, 0.2, 1];
  backFoot2.matrix = backCalf2CoordinatesMat; // use leftArm coordinate system as the starting coordinate system for this cube
  backFoot2.matrix.translate(-0.07, -0.32, 0);
  backFoot2.matrix.rotate(90, 0, 0, 1);
  backFoot2.matrix.rotate(-40+g_backLeg2Angle, 0, 0, 1);
  backFoot2.matrix.scale(0.2, -0.1, 0.22);
  backFoot2.matrix.translate(-0.5, 0.0, -0.0002); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  backFoot2.render();



  // tail1
  var tail1 = new Cube();
  // tail1.color = [1, 0.5, 0.5, 1];
  tail1.matrix.translate(0.53, 0.1, 0.3);
  tail1.matrix.rotate(45, 0, 0, 1);
  tail1.matrix.rotate(90, 1, 0, 0);
  if (shift) {
    tail1.matrix.rotate(g_tailAngle, 1, 0, 0);
  }
  var tail1CoordinatesMat = new Matrix4(tail1.matrix); // store an intermediate matrix. the below scale and translate are for the size while the above are about moving the box. but even with this, the next box is still getting the scaling. this is bc javascript passes by pointer for complex objects, unless u do something otherwise. so to force it to make a copy, create a new matrix
  tail1.matrix.scale(0.1, -0.1, 0.6);
  tail1.matrix.translate(-0.5, 0, 0);
  tail1.render();

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