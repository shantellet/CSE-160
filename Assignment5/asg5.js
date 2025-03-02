import * as THREE from 'three';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

  const fov = 75;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;

  const scene = new THREE.Scene(); // A Scene in three.js is the root of a form of scene graph. Anything you want three.js to draw needs to be added to the scene
  
  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth); // contains the data for a box. Almost anything we want to display in Three.js needs geometry which defines the vertices that make up our 3D object
  
  // It's a little better but it's still hard to see the 3d. What would help is to add some lighting so let's add a light. There are many kinds of lights in three.js which we'll go over in a future article. For now let's create a directional light.
  // Directional lights have a position and a target. Both default to 0, 0, 0. In our case we're setting the light's position to -1, 2, 4 so it's slightly on the left, above, and behind our camera. The target is still 0, 0, 0 so it will shine toward the origin.
  // We also need to change the material. The MeshBasicMaterial is not affected by lights. Let's change it to a MeshPhongMaterial which is affected by lights.
  const color = 0xFFFFFF;
	const intensity = 3;
	const light = new THREE.DirectionalLight(color, intensity);
	light.position.set(-1, 2, 4);
	scene.add(light);
  
  renderer.render(scene, camera);

  // First we'll make a function that creates a new material with the specified color. Then it creates a mesh using the specified geometry and adds it to the scene and sets its X position.
  function makeInstance(geometry, color, x) {

    const material = new THREE.MeshPhongMaterial({color});
    
  // We then create a Mesh. A Mesh in three.js represents the combination of three things
    // A Geometry (the shape of the object)
    // A Material (how to draw the object, shiny or flat, what color, what texture(s) to apply. Etc.)
    // The position, orientation, and scale of that object in the scene relative to its parent. In the code below that parent is the scene.
	const cube = new THREE.Mesh(geometry, material);
	scene.add(cube); // And finally we add that mesh to the scene
   
	cube.position.x = x;
   
	return cube;
  }

  // make 3 cubes with 3 diff colors and x positions
  const cubes = [
	makeInstance(geometry, 0x44aa88,  0),
	makeInstance(geometry, 0x8844aa, -2),
	makeInstance(geometry, 0xaa8844,  2),
  ];
  
  // Let's animate it spinning and hopefully that will make it clear it's being drawn in 3D. To animate it we'll render inside a render loop using requestAnimationFrame
  function render(time) {
	time *= 0.001;  // convert time to seconds
   
  // Finally we'll spin all 3 cubes in our render function. We compute a slightly different rotation for each one.
	cubes.forEach((cube, ndx) => {
	  const speed = 1 + ndx * .1;
	  const rot = time * speed;
    // We then set the cube's X and Y rotation to the current time. These rotations are in radians. There are 2 pi radians in a circle so our cube should turn around once on each axis in about 6.28 seconds.
	  cube.rotation.x = rot;
	  cube.rotation.y = rot;
	});
  
  // We can then render the scene by calling the renderer's render function and passing it the scene and the camera
	renderer.render(scene, camera);
   
  // requestAnimationFrame is a request to the browser that you want to animate something. You pass it a function to be called. In our case that function is render. The browser will call your function and if you update anything related to the display of the page the browser will re-render the page. In our case we are calling three's renderer.render function which will draw our scene.
	requestAnimationFrame(render); // We then render the scene and request another animation frame to continue our loop.
  }
  requestAnimationFrame(render); // Outside the loop we call requestAnimationFrame one time to start the loop.
}

main();