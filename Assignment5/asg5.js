import * as THREE from 'three';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';

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

  const texture = loader.load( 'resources/images/wall.jpg' );
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });

  // We then create a Mesh. A Mesh in three.js represents the combination of three things
    // A Geometry (the shape of the object)
    // A Material (how to draw the object, shiny or flat, what color, what texture(s) to apply. Etc.)
    // The position, orientation, and scale of that object in the scene relative to its parent. In the code below that parent is the scene.
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube); // And finally we add that mesh to the scene
   
  cubes.push(cube); // add to our list of cubes to rotate

  // We'll use a simple class to give lil-gui an object that it can manipulate in degrees but that will set a property in radians.
  class DegRadHelper {
    constructor(obj, prop) {
      this.obj = obj;
      this.prop = prop;
    }
    get value() {
      return THREE.MathUtils.radToDeg(this.obj[this.prop]);
    }
    set value(v) {
      this.obj[this.prop] = THREE.MathUtils.degToRad(v);
    }
  }

  // We also need a class that will convert from a string like "123" into a number like 123 since three.js requires numbers for enum settings like wrapS and wrapT but lil-gui only uses strings for enums.
  class StringToNumberHelper {
    constructor(obj, prop) {
      this.obj = obj;
      this.prop = prop;
    }
    get value() {
      return this.obj[this.prop];
    }
    set value(v) {
      this.obj[this.prop] = parseFloat(v);
    }
  }

  // Using those classes we can setup a simple GUI for the settings above
  const wrapModes = {
    'ClampToEdgeWrapping': THREE.ClampToEdgeWrapping,
    'RepeatWrapping': THREE.RepeatWrapping,
    'MirroredRepeatWrapping': THREE.MirroredRepeatWrapping,
  };
   
  function updateTexture() {
    texture.needsUpdate = true;
  }
   
  const gui = new GUI();
  gui.add(new StringToNumberHelper(texture, 'wrapS'), 'value', wrapModes)
    .name('texture.wrapS')
    .onChange(updateTexture);
  gui.add(new StringToNumberHelper(texture, 'wrapT'), 'value', wrapModes)
    .name('texture.wrapT')
    .onChange(updateTexture);
  gui.add(texture.repeat, 'x', 0, 5, .01).name('texture.repeat.x');
  gui.add(texture.repeat, 'y', 0, 5, .01).name('texture.repeat.y');
  gui.add(texture.offset, 'x', -2, 2, .01).name('texture.offset.x');
  gui.add(texture.offset, 'y', -2, 2, .01).name('texture.offset.y');
  gui.add(texture.center, 'x', -.5, 1.5, .01).name('texture.center.x');
  gui.add(texture.center, 'y', -.5, 1.5, .01).name('texture.center.y');
  gui.add(new DegRadHelper(texture, 'rotation'), 'value', -360, 360)
    .name('texture.rotation');

  // The last thing to note about the example is that if you change wrapS or wrapT on the texture you must also set texture.needsUpdate so three.js knows to apply those settings. The other settings are automatically applied.
  
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