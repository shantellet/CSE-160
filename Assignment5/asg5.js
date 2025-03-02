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
  
  const cubes = []; // just an array we can use to rotate the cubes
  const loader = new THREE.TextureLoader();

  const materials = [
    new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-1.jpg')}),
    new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-2.jpg')}),
    new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-3.jpg')}),
    new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-4.jpg')}),
    new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-5.jpg')}),
    new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-6.jpg')}),
  ];

  // We then create a Mesh. A Mesh in three.js represents the combination of three things
    // A Geometry (the shape of the object)
    // A Material (how to draw the object, shiny or flat, what color, what texture(s) to apply. Etc.)
    // The position, orientation, and scale of that object in the scene relative to its parent. In the code below that parent is the scene.
  const cube = new THREE.Mesh(geometry, materials);

  scene.add(cube); // And finally we add that mesh to the scene
   
  cubes.push(cube); // add to our list of cubes to rotate
  
  function resizeRendererToDisplaySize( renderer ) {

    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if ( needResize ) {

      renderer.setSize( width, height, false );

    }

    return needResize;

  }

  function loadColorTexture( path ) {
    const texture = loader.load( path );
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
  
  // Let's animate it spinning and hopefully that will make it clear it's being drawn in 3D. To animate it we'll render inside a render loop using requestAnimationFrame
  function render(time) {
    time *= 0.001;  // convert time to seconds

    if ( resizeRendererToDisplaySize( renderer ) ) {

      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();

    }
    
    // Finally we'll spin all 3 cubes in our render function. We compute a slightly different rotation for each one.
    cubes.forEach((cube, ndx) => {
      const speed = 0.2 + ndx * .1;
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