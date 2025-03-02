// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program


var VSHADER_SOURCE = `
precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV; // UV coords only have 2 params instead of 4
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix; // add a matrix so we can use it to change where our cube shows up on the screen
  uniform mat4 u_NormalMatrix;
  uniform mat4 u_GlobalRotateMatrix; // add a slider that lets us rotate the animal around so we can it from all sides. eventually will be a camera action. simulating a camera
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV; // prevent browser from erroring that you're not using the v_UV variable so i'm deleting v_UV

    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1)));
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  // varying variable: a_... are variables that come from JS. and they are attributes, so they come by each vertex. so each of the 3 vertices of the triangle will each have a diff UV. need to get that to my fragment shader bc that's where we'll use this info. to pass things from vertex shader to fragment shader, assign them into a varying var. take the same definition and put that in the fragment shader.
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;

  uniform sampler2D u_Sampler0; // a sampler is a texture that we'll look up from
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform bool u_lightOn;
  uniform vec3 u_lightColor;

  uniform bool u_spotlightOn;
  uniform vec3 u_spotlightPosition;
  uniform vec4 u_spotlightColor;
  uniform vec3 u_spotlightDirection;
  uniform float u_spotlightCutoff;
  uniform float u_spotlightExponent;
  
  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0); // set the object to set the color to whatever the normal is
    }
    else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;    // Use color
    }
    else if (u_whichTexture == -1) { // Use UV debug color
      gl_FragColor = vec4(v_UV, 1.0, 1.0); // now set pixel color to whatever we pass for UV
    }
    else if (u_whichTexture == 0) {  // Use texture0
      gl_FragColor = texture2D(u_Sampler0, v_UV); // listing 5.7 in book
    }
    else if (u_whichTexture == 1) {  // Use texture1
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    }
    else if (u_whichTexture == 2) {  // Use texture2
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    }
    else if (u_whichTexture == 3) {  // Use texture3
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    }
    else {                           // Error, put Redish
      gl_FragColor = vec4(1, 0.2, 0.2, 1);
    }
    
    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);
    // if (r < 1.0) {
    //   gl_FragColor = vec4(1, 0, 0, 1); // red
    // }
    // else if (r < 2.0) {
    //   gl_FragColor = vec4(0, 1, 0, 1); //
    // }
    
    // Light Falloff Visualization 1/r^2
    // gl_FragColor = vec4(vec3(gl_FragColor) / (r * r), 1);

    // normalize the light vector
    // N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);

    // Reflection
    vec3 R = reflect(-L, N);

    // eye
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    // Specular
    // float specular = pow(max(dot(E, R), 0.0), 10.0);
    float specular = pow(max(dot(E, R), 0.0), 64.0) * 0.8;

    vec3 diffuse = vec3(1.0, 1.0, 0.9) * vec3(gl_FragColor) * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.2 * u_lightColor;
    if (u_lightOn) {
      if (u_whichTexture == 0) {
        gl_FragColor = vec4(diffuse + ambient + specular, 1.0);
      }
      else {
        gl_FragColor = vec4(diffuse + ambient, 1.0);
      }
    }

    // spotlight
    if (u_spotlightOn) {
      vec3 spotlightDirection = normalize(u_spotlightPosition - vec3(v_VertPos));
      float theta = dot(spotlightDirection, -normalize(u_spotlightDirection));

      if (theta > u_spotlightCutoff) {
        float spotlightFactor = pow(theta, u_spotlightExponent);
        vec3 spotlightEffect = spotlightFactor * vec3(u_spotlightColor);

        float nDotLSpotlight = max(dot(v_Normal, spotlightDirection), 0.0);
        vec3 spotlightDiffuse = nDotLSpotlight * spotlightEffect;
        gl_FragColor += vec4(spotlightDiffuse, 0.0);
      }
    }
  }`



// Global Variables
// UI elements or data we have to pass from JS to GLSL (which we know we'll only have 1 copy)
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_lightPos;
let u_cameraPos;
let u_lightOn;
let u_lightColor;

let u_spotlightOn;
let u_spotlightPosition;
let u_spotlightColor;
let u_spotlightDirection;
let u_spotlightCutoff;
let u_spotlightExponent;

let u_FragColor;
let u_ModelMatrix;
let u_NormalMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_whichTexture;

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

  // // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of a_Normal
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }
  
  // Get the storage location of u_lightPos
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  // Get the storage location of u_cameraPos
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }

  // Get the storage location of u_lightOn
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }
  
  // Get the storage location of u_lightColor
  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if (!u_lightColor) {
    console.log('Failed to get the storage location of u_lightColor');
    return;
  }

  // Get the storage location of u_spotlightOn
  u_spotlightOn = gl.getUniformLocation(gl.program, 'u_spotlightOn');
  if (!u_spotlightOn) {
    console.log('Failed to get the storage location of u_spotlightOn');
    return;
  }

  // Get the storage location of u_spotlightPosition
  u_spotlightPosition = gl.getUniformLocation(gl.program, 'u_spotlightPosition');
  if (!u_spotlightPosition) {
    console.log('Failed to get the storage location of u_spotlightPosition');
    return;
  }
  
  // Get the storage location of u_spotlightColor
  u_spotlightColor = gl.getUniformLocation(gl.program, 'u_spotlightColor');
  if (!u_spotlightColor) {
    console.log('Failed to get the storage location of u_spotlightColor');
    return;
  }

  // Get the storage location of u_spotlightDirection
  u_spotlightDirection = gl.getUniformLocation(gl.program, 'u_spotlightDirection');
  if (!u_spotlightDirection) {
    console.log('Failed to get the storage location of u_spotlightDirection');
    return;
  }

  // Get the storage location of u_spotlightCutoff
  u_spotlightCutoff = gl.getUniformLocation(gl.program, 'u_spotlightCutoff');
  if (!u_spotlightCutoff) {
    console.log('Failed to get the storage location of u_spotlightCutoff');
    return;
  }

  // Get the storage location of u_spotlightExponent
  u_spotlightExponent = gl.getUniformLocation(gl.program, 'u_spotlightExponent');
  if (!u_spotlightExponent) {
    console.log('Failed to get the storage location of u_spotlightExponent');
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
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_NormalMatrix
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
    return;
  }
  
  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }
  
  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  // Get the storage location of u_Sampler2
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }

  // Get the storage location of u_Sampler3
  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return false;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

let g_selectedColor = [1.0,1.0,1.0,1.0];

let g_xGlobalAngle = 0;
let g_yGlobalAngle = 0;

let g_earAngle = 0;
let g_frontLeg1Angle = 0;
let g_frontLeg2Angle = 0;
let g_backLeg1Angle = 0;
let g_backLeg2Angle = 0;
let g_neckAngle = 0;
let g_tailAngle = 0;

let g_earAnimation = false;
let g_frontLeg1Animation = false;
let g_frontLeg2Animation = false;
let g_neckAnimation = false;
let g_backLeg1Animation = false;
let g_backLeg2Animation = false;
let g_animation = true;
let shift = false;

let g_normalOn = false;
let g_lightPos = [0, 1, 1];
let g_lightOn = true;
let g_lightColor = new Vector3([1, 1, 1]);

let g_spotlightOn = false;
let g_spotlight = [
  [0.0, 1.0, 0.0], // position
  [1.0, 1.0, 1.0, 1.0], // color
  [0.0, -1.0, 0.0], // direction
  Math.cos(Math.PI / 5), // cutoff
  3.0 // exponent
];

let camera;

// Set up actions for the HTML UI elements (how to deal with the buttons)
function addActionsForHtmlUI() {
  document.getElementById('normalOn').onclick = function() { g_normalOn = true; };
  document.getElementById('normalOff').onclick = function() { g_normalOn = false; };

  document.getElementById('lightOn').onclick = function() { g_lightOn = true; };
  document.getElementById('lightOff').onclick = function() { g_lightOn = false; };
  
  document.getElementById('spotlightOn').onclick = function() { g_spotlightOn = true; };
  document.getElementById('spotlightOff').onclick = function() { g_spotlightOn = false; };
  
  document.getElementById('animationOffButton').onclick = function() { g_animation = false; };
  document.getElementById('animationOnButton').onclick = function() { g_animation = true; };
  // document.getElementById('animationYellowOffButton').onclick = function() { g_yellowAnimation = false; };
  // document.getElementById('animationYellowOnButton').onclick = function() { g_yellowAnimation = true; };

  // document.getElementById('animationMagentaOffButton').onclick = function() { g_magentaAnimation = false; };
  // document.getElementById('animationMagentaOnButton').onclick = function() { g_magentaAnimation = true; }

  // document.getElementById('magentaSlide').addEventListener('mousemove', function() { g_magentaAngle = this.value; renderScene(); });
  // document.getElementById('yellowSlide').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderScene(); });

  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightPos[0] = this.value / 100; renderScene(); }});
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightPos[1] = this.value / 100; renderScene(); }});
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightPos[2] = this.value / 100; renderScene(); }});

  document.getElementById('redLightSlide').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightColor[0] = this.value / 255; }});
  document.getElementById('greenLightSlide').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightColor[1] = this.value / 255; }});
  document.getElementById('blueLightSlide').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightColor[2] = this.value / 255; }});


  document.getElementById('xAngleSlide').addEventListener('mousemove', function() { g_xGlobalAngle = parseInt(this.value); renderScene(); });
  // document.getElementById('yAngleSlide').addEventListener('mousemove', function() { g_yGlobalAngle = parseInt(this.value); renderScene(); });
  // document.getElementById('zAngleSlide').addEventListener('input', function() { g_zGlobalAngle = this.value; renderScene(); });

  canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) }};

  canvas.onmousedown = startDragging;
  canvas.onmouseup = stopDragging;
  canvas.onmousemove = handleDragging;

}

function initTextures() {
  var image0 = new Image(); // Create the image object
  if (!image0) {
    console.log('Failed to create the image0 object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image0.onload = function() { sendTextureToTEXTURE0(image0); } // remember the image is stored on a webserver somewhere, and it may be slow to load. so can't immediately take the image and start passing it to the gpu cuz it hasn't loaded. so 'onload' is a function that runs after the loading as completed
  // Tell the browser to load
  image0.src = './15_paving flagstone texture-seamless.jpg';


  var image1 = new Image(); // Create the image object
  if (!image1) {
    console.log('Failed to create the image1 object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image1.onload = function() { sendTextureToTEXTURE1(image1); }
  image1.src = './95_artificial green grass texture-seamless.jpg';

  var image2 = new Image(); // Create the image object
  if (!image2) {
    console.log('Failed to create the image2 object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image2.onload = function() { sendTextureToTEXTURE2(image2); }
  image2.src = './volcano_floor.png';

  var image3 = new Image(); // Create the image object
  if (!image3) {
    console.log('Failed to create the image3 object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image3.onload = function() { sendTextureToTEXTURE3(image3); }
  image3.src = './trak_bricks1_y.jpg';

  return true;
}

function sendTextureToTEXTURE0(image) {
  var texture0 = gl.createTexture(); // Create a texture object
  if (!texture0) {
    console.log('Failed to create the texture0 object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0 (there are 8 texture units and we can store different textures in different units)
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture0);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);

  // gl.clear(gl.COLOR_BUFFER_BIT); // Clear <canvas>

  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  console.log('finished loadTexture');
}

function sendTextureToTEXTURE1(image) {
  var texture1 = gl.createTexture(); // Create a texture object
  if (!texture1) {
    console.log('Failed to create the texture1 object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture1);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler1, 1);

  console.log('finished loadTexture');
}

function sendTextureToTEXTURE2(image) {
  var texture2 = gl.createTexture(); // Create a texture object
  if (!texture2) {
    console.log('Failed to create the texture2 object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, texture2);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler2, 2);

  console.log('finished loadTexture');
}

function sendTextureToTEXTURE3(image) {
  var texture3 = gl.createTexture(); // Create a texture object
  if (!texture3) {
    console.log('Failed to create the texture3 object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, texture3);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler3, 3);

  console.log('finished loadTexture');
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
      // document.getElementById('yAngleSlide').value = g_yGlobalAngle;

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

  camera = new Camera();
  camera.renderCamera();  
  
  // Register function (event handler) to be called on a mouse press
  // canvas.onmousedown = click;
  // canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) } }; // want to draw when move mouse with mouse pressed

  document.onkeydown = keydown;

  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.6, 0.8, 1.0, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);

  // Render
  // renderScene(); // instead of clearing the canvas and waiting for a click, now going to render all shapes at the end of the canvas
  requestAnimationFrame(tick); // requet the initial animation frame at the beginning of main, which will get everything started. now this will run automatically.
}

let speedMultiplier = 0.1;
let fastSpeedMultiplier = 0.2; // double the speed
let isFastMode = false;

function keydown(ev) {
  let currentSpeed = isFastMode ? fastSpeedMultiplier : speedMultiplier;

  if (ev.keyCode == 87) { // w
    camera.moveForward(currentSpeed);
  } else if (ev.keyCode == 83) { // s
    camera.moveBackward(currentSpeed);
  } else if (ev.keyCode == 65) { // a
    camera.moveLeft(currentSpeed);
  } else if (ev.keyCode == 68) { // d
    camera.moveRight(currentSpeed);
  } else if (ev.keyCode == 81) { // q
    camera.panLeft();
  } else if (ev.keyCode == 69) { // e
    camera.panRight();
  // } else if (ev.keyCode == 82) { // r
  //   console.log("add block function called");
  //   addBlock();
  // } else if (ev.keyCode == 70) { // f
  //   console.log("delete block function called");
  //   deleteBlock();
  } else if (ev.keyCode == 32) { // spacebar
    ev.preventDefault(); // prevent scrolling page when press spacebar
    isFastMode = !isFastMode;
    console.log("fast mode toggled:", isFastMode);
  }

  renderScene();
  camera.renderCamera();
  console.log(ev.keyCode);
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

  g_lightPos[0] = 2.3 * Math.cos(g_seconds);
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

// var g_map = [ // 1 = wall, 0 = no wall
// //0 1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31
// [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
// [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], // 1
// [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], // 2
// [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 3
// [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // 4
// [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // 5
// [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // 6
// [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 7
// [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 8
// [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 9
// [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 10
// [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 11
// [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1], // 12
// [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 13
// [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 14
// [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 15
// [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1], // 16
// [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 17
// [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 18
// [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 19
// [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 20
// [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1], // 21
// [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 22
// [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 23
// [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 24
// [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 25
// [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1], // 26
// [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 27
// [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 28
// [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 29
// [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 30
// [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 31
// ];

// var g_kibbleMap = [ // 1 = wall, 0 = no wall, 2 = kibble
//   //0 1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31
//   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
//   [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], // 1
//   [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], // 2
//   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 3
//   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // 4
//   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // 5
//   [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // 6
//   [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 7
//   [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 8
//   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1], // 9
//   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1], // 10
//   [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1], // 11
//   [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1], // 12
//   [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 13
//   [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2, 0, 0, 2, 0, 2, 0, 0, 0, 1], // 14
//   [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 15
//   [1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 1, 1, 1, 1, 1, 1, 1], // 16
//   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 17
//   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 18
//   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 1], // 19
//   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1], // 20
//   [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1], // 21
//   [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1], // 22
//   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1], // 23
//   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 1], // 24
//   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 25
//   [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1], // 26
//   [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1], // 27
//   [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 28
//   [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 29
//   [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 30
//   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 31
//   ];

// function drawMap() {
//   for (x = 0; x < 33; x++) {
//     for (y = 0; y < 33; y++) {
//       // console.log(x, y);
//       if (g_map[x][y] == 1) { // if wall
//         var body = new Cube(); // create a cube to represent the wall
//         body.color = [1.0, 1.0, 1.0, 1.0];
//         body.matrix.translate(x - 4, -0.75, y - 4); // move wall to right place
//         body.renderfast();
//       }
//     }
//   }
// }

// function drawMap() {
//     for (x = 0; x < 32; x++) {
//       for (y = 0; y < 32; y++) {
//         if (g_map[x][y] >= 1) {
//           for (i = 0; i < g_map[x][y]; i++) {
//             var wall = new Cube(); // create a cube to represent kibble
//             wall.textureNum = 1;
//     // console.log(x, y);
//           // if (x == 0 || x == 31 || y == 0 || y == 31) { // hardcoding boundaries of the box for now
//             wall.color = [0.8, 1.0, 1.0, 1.0];
//             // wall.matrix.translate(0, -0.75, 0);
//             // wall.matrix.scale(0.4, 0.4, 0.4);
//             wall.matrix.translate(x - 16, i - 0.75, y - 16); // move wall to right place
//             // wall.render3DUVNormalFast();
//             wall.renderfaster();
//           }
//         }
//       }
//     }
// }

// function drawkibbleMap() {
//   for (x = 0; x < 32; x++) {
//     for (y = 0; y < 32; y++) {
//       if (g_kibbleMap[x][y] >= 2) {
//         for (i = 0; i < g_kibbleMap[x][y] - 1; i++) {
//           var kibble = new Cube(); // create a cube to represent the kibble
//           kibble.textureNum = 3;
//   // console.log(x, y);
//         // if (x == 0 || x == 31 || y == 0 || y == 31) { // hardcoding boundaries of the box for now
//           kibble.color = [0.5, 0.3, 0.2, 1.0];
//           // kibble.matrix.translate(0, -0.75, 0);
//           // kibble.matrix.scale(0.4, 0.4, 0.4);
//           kibble.matrix.translate(x - 16, i - 0.75, y - 16); // move kibble to right place
//           // kibble.render3DUVNormalFast();
//           kibble.matrix.scale(0.3, 0.2, 0.3)
//           kibble.renderfaster();
//         }
//       }
//     }
//   }
// }

// function addBlock() {
//   let f = new Vector3();
//   f.set(camera.at);
//   f.sub(camera.eye);
//   f.normalize();
//   f.mul(3);
//   let g = new Vector3();
//   g.set(camera.eye);
//   g.add(f);

//   let x = Math.floor(g.elements[0]) + 16;
//   let z = Math.floor(g.elements[2]) + 16;
//   let y = -0.75; // Default y level

//   // Check for existing blocks and adjust y
//   for (let i = 0; i < g_map.length; i++) {
//       if (g_map[x][z] > 0) { // If a block exists
//           y += 1; // Increment y to stack on top
//           break; // Stop checking after finding the first block
//       }
//   }

//   g_map[x][z] += 1; // Increment the map value to represent a block
//   renderScene();
// }

// function deleteBlock() {
//   let f = new Vector3();
//   f.set(camera.at);
//   f.sub(camera.eye);
//   f.normalize();
//   f.mul(3);
//   let g = new Vector3();
//   g.set(camera.eye);
//   g.add(f);

//   let x = Math.floor(g.elements[0]) + 16;
//   let z = Math.floor(g.elements[2]) + 16;

//   // Find the topmost block
//   if (g_map[x][z] > 0) {
//       g_map[x][z] -= 1; // Decrement the map value
//   }
//   renderScene();
// }


// Extract the event click adn return it in WebGL coordinates
// function convertCoordinatesEventToGL(ev) {
//   var x = ev.clientX; // x coordinate of a mouse pointer
//   var y = ev.clientY; // y coordinate of a mouse pointer
//   var rect = ev.target.getBoundingClientRect();

//   x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
//   y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

//   return ([x, y]);
// }


// to control where our camera is in the world
// var g_eye = [0,0,3];
// var g_at = [0,0,-100];
// var g_up = [0,1,0];

function renderDog() {

  var body = new Cube(); // body of animal
  // body.color = [1, 1, 0, 1];
  // body.textureNum = 0;
  body.matrix.setTranslate(0.75, 0, -1.3);
  if (g_normalOn) body.textureNum = -3;
  body.matrix.translate(-0.4, -0.3, 0.0); // use setTranslate instead of translate because translate assumes we start with an identity matrix
  body.matrix.rotate(0, 1, 0, 0);
  body.matrix.scale(1, 0.5, 0.5);
  body.matrix.translate(0, 0, 0.001);
  // remember these happen in reverse order because these are right multiplies. we started with identity matrix, right multiply a setTranslate, then right multiply a scale. so scale is happening first, then translate
  
  body.normalMatrix.setInverseOf(body.matrix).transpose();

  body.render3DUVNormalFast();

  // neck
  var neck = new Cube();
  // neck.matrix.setTranslate(14, 0, 3);
  neck.matrix.setTranslate(0.75, 0, -1.3);
  // neck.color = [1, 1, 0, 1];
  if (g_normalOn) neck.textureNum = -3;
  neck.matrix.translate(-0.5, 0, 0.1);
  neck.matrix.rotate(-45, 0, 0, 1);
  neck.matrix.rotate(g_neckAngle, 0, 0, 1);
  var neckCoordinatesMat = new Matrix4(neck.matrix); // store an intermediate matrix. the below scale and translate are for the size while the above are about moving the box. but even with this, the next box is still getting the scaling. this is bc javascript passes by pointer for complex objects, unless u do something otherwise. so to force it to make a copy, create a new matrix
  neck.matrix.scale(0.3, 0.3, 0.3);
  neck.matrix.translate(-0.5, 0, 0);
  neck.normalMatrix.setInverseOf(neck.matrix).transpose();
  neck.render3DUVNormalFast();

  // head
  var head = new Cube();
  if (g_normalOn) head.textureNum = -3;
  // head.color = [1, 0, 1, 1];
  head.matrix = neckCoordinatesMat; // use leftArm coordinate system as the starting coordinate system for this cube
  head.matrix.rotate(45, 0, 0, 1);
  head.matrix.translate(-0.2, 0, -0.001);
  // head.matrix.rotate(30+g_leg1Angle, 0, 0, 1);
  var headCoordinatesMat = new Matrix4(head.matrix);
  head.matrix.scale(0.3, 0.3, 0.3);
  head.matrix.translate(0, 0, -0.0001);
  // head.matrix.translate(-0.5, 0.0, -0.0001); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  head.normalMatrix.setInverseOf(head.matrix).transpose();
  head.render3DUVNormalFast();

  // ear1
  var ear1 = new Cube();
  if (g_normalOn) ear1.textureNum = -3;
  ear1.color = [0.5, 0.3, 0.2, 1];
  ear1.matrix.set(headCoordinatesMat); // use IDENTITY MATRIX to apply translations and rotations but NOT scaling // fixes the problem with the weird cube next to the pyramid
  ear1.matrix.translate(0.1, 0.25, 0.15);
  ear1.matrix.rotate(g_earAngle, 0, 0, 1);
  // ear1.matrix.rotate(-90, 1, 0, 0);
  // ear1.matrix.rotate(-30+g_leg1Angle, 0, 0, 1);
  ear1.matrix.scale(0.15, 0.15, 0.3);
  ear1.matrix.translate(-0.4, 0.0, -0.0002); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  // ear1.normalMatrix.setInverseOf(ear1.matrix).transpose();
  ear1.render3DUVNormalFast();

   // ear2
  var ear2 = new Cube();
  if (g_normalOn) ear2.textureNum = -3;
  ear2.color = [0.5, 0.3, 0.2, 1];
  ear2.matrix.set(headCoordinatesMat); // use IDENTITY MATRIX to apply translations and rotations but NOT scaling // fixes the problem with the weird cube next to the pyramid
  ear2.matrix.translate(0.1, 0.25, -0.15);
  ear2.matrix.rotate(g_earAngle, 0, 0, 1);
  // ear2.matrix.rotate(-90, 1, 0, 0);
  // ear2.matrix.rotate(-30+g_leg1Angle, 0, 0, 1);
  ear2.matrix.scale(0.15, 0.15, 0.3);
  ear2.matrix.translate(-0.4, 0.0, -0.0002); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  // ear2.normalMatrix.setInverseOf(ear2.matrix).transpose();
  ear2.render3DUVNormalFast();

  // snout
  var snout = new Cube();
  if (g_normalOn) snout.textureNum = -3;
  snout.color = [0.5, 0.3, 0.2, 1];
  snout.matrix = headCoordinatesMat; // use leftArm coordinate system as the starting coordinate system for this cube
  snout.matrix.translate(-0.12, 0, 0);
  // snout.matrix.rotate(90, 0, 0, 1);
  // snout.matrix.rotate(-30+g_leg1Angle, 0, 0, 1);
  snout.matrix.scale(0.2, 0.16, 0.3);
  snout.matrix.translate(-0.4, 0.0, -0.0002); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  // snout.normalMatrix.setInverseOf(snout.matrix).transpose();
  snout.render3DUVNormalFast();



  // want a function that lets us update the state of the angles but does not immediately flash back to the last thing on the slider
  // frontThigh1
  var frontThigh1 = new Cube();
  if (g_normalOn) frontThigh1.textureNum = -3;
  // frontThigh1.matrix.setTranslate(14, 0, 3);
  frontThigh1.matrix.setTranslate(0.75, 0, -1.3);
  // frontThigh1.color = [1, 1, 0, 1];
  frontThigh1.matrix.translate(-0.2, 0, 0.01);
  // frontThigh1.matrix.rotate(-5, 1, 0, 0);
  frontThigh1.matrix.rotate(g_frontLeg1Angle, 0, 0, 1);
  var frontThigh1CoordinatesMat = new Matrix4(frontThigh1.matrix); // store an intermediate matrix. the below scale and translate are for the size while the above are about moving the box. but even with this, the next box is still getting the scaling. this is bc javascript passes by pointer for complex objects, unless u do something otherwise. so to force it to make a copy, create a new matrix
  frontThigh1.matrix.scale(0.08, -0.5, 0.22);
  frontThigh1.matrix.translate(-0.5, 0, 0);
  frontThigh1.normalMatrix.setInverseOf(frontThigh1.matrix).transpose();
  frontThigh1.render3DUVNormalFast();

  // frontCalf1
  var frontCalf1 = new Cube();
  if (g_normalOn) frontCalf1.textureNum = -3;
  // frontCalf1.color = [1, 0, 1, 1];
  frontCalf1.matrix = frontThigh1CoordinatesMat; // use leftArm coordinate system as the starting coordinate system for this cube
  frontCalf1.matrix.translate(0, -0.45, 0);
  frontCalf1.matrix.rotate(30+g_frontLeg1Angle, 0, 0, 1);
  var frontCalf1CoordinatesMat = new Matrix4(frontCalf1.matrix);
  frontCalf1.matrix.scale(0.08, -0.3, 0.22);
  frontCalf1.matrix.translate(-0.5, 0.0, -0.0001); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  frontCalf1.normalMatrix.setInverseOf(frontCalf1.matrix).transpose();
  frontCalf1.render3DUVNormalFast();

  // frontFoot1
  var frontFoot1 = new Cube();
  if (g_normalOn) frontFoot1.textureNum = -3;
  frontFoot1.color = [0.5, 0.3, 0.2, 1];
  frontFoot1.matrix = frontCalf1CoordinatesMat; // use leftArm coordinate system as the starting coordinate system for this cube
  frontFoot1.matrix.translate(-0.07, -0.32, 0);
  frontFoot1.matrix.rotate(90, 0, 0, 1);
  frontFoot1.matrix.rotate(-40+g_frontLeg1Angle, 0, 0, 1);
  frontFoot1.matrix.scale(0.2, -0.1, 0.22);
  frontFoot1.matrix.translate(-0.5, 0.0, -0.0002); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  frontFoot1.normalMatrix.setInverseOf(frontFoot1.matrix).transpose();
  frontFoot1.render3DUVNormalFast();
  


  // frontThigh2
  var frontThigh2 = new Cube();
  if (g_normalOn) frontThigh2.textureNum = -3;
  // frontThigh2.matrix.setTranslate(14, 0, 3);
  frontThigh2.matrix.setTranslate(0.75, 0, -1.3);
  // frontThigh2.color = [1, 1, 0, 1];
  frontThigh2.matrix.translate(-0.2, 0, 0.27);
  // frontThigh2.matrix.rotate(-5, 1, 0, 0);
  frontThigh2.matrix.rotate(g_frontLeg2Angle, 0, 0, 1);
  var frontThigh2CoordinatesMat = new Matrix4(frontThigh2.matrix); // store an intermediate matrix. the below scale and translate are for the size while the above are about moving the box. but even with this, the next box is still getting the scaling. this is bc javascript passes by pointer for complex objects, unless u do something otherwise. so to force it to make a copy, create a new matrix
  frontThigh2.matrix.scale(0.08, -0.5, 0.22);
  frontThigh2.matrix.translate(-0.5, 0, 0);
  frontThigh2.normalMatrix.setInverseOf(frontThigh2.matrix).transpose();
  frontThigh2.render3DUVNormalFast();

  // frontCalf2
  var frontCalf2 = new Cube();
  if (g_normalOn) frontCalf2.textureNum = -3;
  // frontCalf2.color = [1, 0, 1, 1];
  frontCalf2.matrix = frontThigh2CoordinatesMat; // use leftArm coordinate system as the starting coordinate system for this cube
  frontCalf2.matrix.translate(0, -0.45, 0);
  frontCalf2.matrix.rotate(30+g_frontLeg2Angle, 0, 0, 1);
  var frontCalf2CoordinatesMat = new Matrix4(frontCalf2.matrix);
  frontCalf2.matrix.scale(0.08, -0.3, 0.22);
  frontCalf2.matrix.translate(-0.5, 0.0, -0.0001); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  frontCalf2.normalMatrix.setInverseOf(frontCalf2.matrix).transpose();
  frontCalf2.render3DUVNormalFast();

  // frontFoot2
  var frontFoot2 = new Cube();
  if (g_normalOn) frontFoot2.textureNum = -3;
  frontFoot2.color = [0.5, 0.3, 0.2, 1];
  frontFoot2.matrix = frontCalf2CoordinatesMat; // use leftArm coordinate system as the starting coordinate system for this cube
  frontFoot2.matrix.translate(-0.07, -0.32, 0);
  frontFoot2.matrix.rotate(90, 0, 0, 1);
  frontFoot2.matrix.rotate(-40+g_frontLeg2Angle, 0, 0, 1);
  frontFoot2.matrix.scale(0.2, -0.1, 0.22);
  frontFoot2.matrix.translate(-0.5, 0.0, -0.0002); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  frontFoot2.normalMatrix.setInverseOf(frontFoot2.matrix).transpose();
  frontFoot2.render3DUVNormalFast();



  // backThigh1
  var backThigh1 = new Cube();
  if (g_normalOn) backThigh1.textureNum = -3;
  // backThigh1.matrix.setTranslate(14, 0, 3);
  backThigh1.matrix.setTranslate(0.75, 0, -1.3);
  // backThigh1.color = [1, 1, 0, 1];
  backThigh1.matrix.translate(0.4, 0, 0.0);
  // backThigh1.matrix.rotate(-5, 1, 0, 0);
  backThigh1.matrix.rotate(g_backLeg1Angle, 0, 0, 1);
  var backThigh1CoordinatesMat = new Matrix4(backThigh1.matrix); // store an intermediate matrix. the below scale and translate are for the size while the above are about moving the box. but even with this, the next box is still getting the scaling. this is bc javascript passes by pointer for complex objects, unless u do something otherwise. so to force it to make a copy, create a new matrix
  backThigh1.matrix.scale(0.08, -0.5, 0.22);
  backThigh1.matrix.translate(-0.5, 0, 0);
  backThigh1.normalMatrix.setInverseOf(backThigh1.matrix).transpose();
  backThigh1.render3DUVNormalFast();

  // backCalf1
  var backCalf1 = new Cube();
  if (g_normalOn) backCalf1.textureNum = -3;
  // backCalf1.color = [1, 0, 1, 1];
  backCalf1.matrix = backThigh1CoordinatesMat; // use leftArm coordinate system as the starting coordinate system for this cube
  backCalf1.matrix.translate(0, -0.45, 0);
  backCalf1.matrix.rotate(30+g_backLeg1Angle, 0, 0, 1);
  var backCalf1CoordinatesMat = new Matrix4(backCalf1.matrix);
  backCalf1.matrix.scale(0.08, -0.3, 0.22);
  backCalf1.matrix.translate(-0.5, 0.0, -0.0001); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  backCalf1.normalMatrix.setInverseOf(backCalf1.matrix).transpose();
  backCalf1.render3DUVNormalFast();

  // backFoot1
  var backFoot1 = new Cube();
  if (g_normalOn) backFoot1.textureNum = -3;
  backFoot1.color = [0.5, 0.3, 0.2, 1];
  backFoot1.matrix = backCalf1CoordinatesMat; // use leftArm coordinate system as the starting coordinate system for this cube
  backFoot1.matrix.translate(-0.07, -0.32, 0);
  backFoot1.matrix.rotate(90, 0, 0, 1);
  backFoot1.matrix.rotate(-40+g_backLeg1Angle, 0, 0, 1);
  backFoot1.matrix.scale(0.2, -0.1, 0.22);
  backFoot1.matrix.translate(-0.5, 0.0, -0.0002); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  backFoot1.normalMatrix.setInverseOf(backFoot1.matrix).transpose();
  backFoot1.render3DUVNormalFast();



  // backThigh2
  var backThigh2 = new Cube();
  if (g_normalOn) backThigh2.textureNum = -3;
  // backThigh2.matrix.setTranslate(14, 0, 3);
  backThigh2.matrix.setTranslate(0.75, 0, -1.3);
  // backThigh2.color = [1, 1, 0, 1];
  backThigh2.matrix.translate(0.4, 0, 0.27);
  // backThigh2.matrix.rotate(-5, 1, 0, 0);
  backThigh2.matrix.rotate(g_backLeg2Angle, 0, 0, 1);
  var backThigh2CoordinatesMat = new Matrix4(backThigh2.matrix); // store an intermediate matrix. the below scale and translate are for the size while the above are about moving the box. but even with this, the next box is still getting the scaling. this is bc javascript passes by pointer for complex objects, unless u do something otherwise. so to force it to make a copy, create a new matrix
  backThigh2.matrix.scale(0.08, -0.5, 0.22);
  backThigh2.matrix.translate(-0.5, 0, 0);
  backThigh2.normalMatrix.setInverseOf(backThigh2.matrix).transpose();
  backThigh2.render3DUVNormalFast();

  // backCalf2
  var backCalf2 = new Cube();
  if (g_normalOn) backCalf2.textureNum = -3;
  // backCalf2.color = [1, 0, 1, 1];
  backCalf2.matrix = backThigh2CoordinatesMat; // use leftArm coordinate system as the starting coordinate system for this cube
  backCalf2.matrix.translate(0, -0.45, 0);
  backCalf2.matrix.rotate(30+g_backLeg2Angle, 0, 0, 1);
  var backCalf2CoordinatesMat = new Matrix4(backCalf2.matrix);
  backCalf2.matrix.scale(0.08, -0.3, 0.22);
  backCalf2.matrix.translate(-0.5, 0.0, -0.0001); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  backCalf2.normalMatrix.setInverseOf(backCalf2.matrix).transpose();
  backCalf2.render3DUVNormalFast();

  // backFoot2
  var backFoot2 = new Cube();
  if (g_normalOn) backFoot2.textureNum = -3;
  backFoot2.color = [0.5, 0.3, 0.2, 1];
  backFoot2.matrix = backCalf2CoordinatesMat; // use leftArm coordinate system as the starting coordinate system for this cube
  backFoot2.matrix.translate(-0.07, -0.32, 0);
  backFoot2.matrix.rotate(90, 0, 0, 1);
  backFoot2.matrix.rotate(-40+g_backLeg2Angle, 0, 0, 1);
  backFoot2.matrix.scale(0.2, -0.1, 0.22);
  backFoot2.matrix.translate(-0.5, 0.0, -0.0002); // if the last thing is 0, it will cause "z-fighting" with the left arm (which means the part where both boxes overlap are at the exact same position (exact floating point) so it keeps on flashing between the two boxes). make it slightly different (the negative means move it forward) so that it's not exactly lined up with the other box
  backFoot2.normalMatrix.setInverseOf(backFoot2.matrix).transpose();
  backFoot2.render3DUVNormalFast();



  // tail1
  var tail1 = new Cube();
  if (g_normalOn) tail1.textureNum = -3;
  // tail1.matrix.setTranslate(14, 0, 3);
  tail1.matrix.setTranslate(0.75, 0, -1.3);
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
  tail1.normalMatrix.setInverseOf(tail1.matrix).transpose();
  tail1.render3DUVNormalFast();
}

// Draw every shape that is supposed to be in the canvas
function renderScene() {

  // Check the time at the start of this function
  var startTime = performance.now();

  // Pass the projection matrix
  // var projMat = new Matrix4();
  var projMat = camera.projMat;
  // projMat.setPerspective(50, 1*canvas.width / canvas.height, 0.1, 100); // 90 deg wide, aspect width/height = 1, near plane is 0.1 (pretty close) and far plane is 100 so we have a wide perspective
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Pass the view matrix
  // var viewMat = new Matrix4();
  var viewMat = camera.viewMat;
  // viewMat.setLookAt(0,0,3, 0,0,-100, 0,1,0); // (eye, at, up)
  // viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0], g_at[1], g_at[2], g_up[0], g_up[1], g_up[2]);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_xGlobalAngle, 0, 1, 0);
  // globalRotMat.rotate(g_yGlobalAngle, 1, 0, 0);
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

  // Pass the light position to GLSL
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

  // Pass the camera position to GLSL
  gl.uniform3f(u_cameraPos, camera.eye.x, camera.eye.y, camera.eye.z);

  // Pass the light status to GLSL
  gl.uniform1i(u_lightOn, g_lightOn);
  
  // Pass the light color to GLSL
  gl.uniform3f(u_lightColor, g_lightColor.elements[0], g_lightColor.elements[1], g_lightColor.elements[2]);

  // Pass the spotlight info to GLSL
  gl.uniform1i(u_spotlightOn, g_spotlightOn);
  gl.uniform3f(u_spotlightPosition, ...g_spotlight[0]);
  gl.uniform4f(u_spotlightColor, ...g_spotlight[1]);
  gl.uniform3f(u_spotlightDirection, ...g_spotlight[2]);
  gl.uniform1f(u_spotlightCutoff, g_spotlight[3]);
  gl.uniform1f(u_spotlightExponent, g_spotlight[4]);

  // drawMap();
  // drawkibbleMap();

  renderDog();

  // Draw the light
  var light = new Cube();
  light.color = [2, 2, 0, 1]; // bright yellow
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-0.1, -0.1, -0.1); // then scale x by 10 and y by 0 to make it into a flat plane
  light.matrix.translate(-0.5, -0.5, -0.5); // box starts out betwen 0 and 1 so move to center first
  // remember these happen in reverse order because these are right multiplies. we started with identity matrix, right multiply a setTranslate, then right multiply a scale. so scale is happening first, then translate
  light.render3DUVNormalFast();

  // Draw the floor
  var floor = new Cube();
  floor.color = [1, 0, 0, 1];
  floor.textureNum = 0;
  if (g_normalOn) floor.textureNum = -3;
  floor.matrix.translate(0, -0.75, 0.0);
  floor.matrix.scale(5, 0, 5); // then scale x by 10 and y by 0 to make it into a flat plane
  floor.matrix.translate(-0.5, 0, -0.5); // box starts out betwen 0 and 1 so move to center first
  // remember these happen in reverse order because these are right multiplies. we started with identity matrix, right multiply a setTranslate, then right multiply a scale. so scale is happening first, then translate
  floor.render3DUVNormalFast();

  // Draw the sky
  var sky = new Cube();
  sky.color = [1, 0, 0, 1];
  sky.textureNum = 1;
  if (g_normalOn) sky.textureNum = -3;
  sky.matrix.scale(-5,-5,-5); // make negative to flip the cube so the normal faces the right way (since we're looking at the inside of the cube instead of outside)
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render3DUVNormalFast();

  // Draw a sphere
  var sphere = new Sphere();
  sphere.color = [1, 0, 0, 1];
  sphere.textureNum = 0;
  if (g_normalOn) sphere.textureNum = -3;
  sphere.matrix.scale(0.5, 0.5, 0.5);
  sphere.matrix.translate(-2.0, 0.25, -1.3);
  sphere.render();

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