import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // OrbitControls let the user spin or orbit the camera around some point
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({antialias: true, canvas});



//////////////////////////////// 4. CAMERA ////////////////////////////////
  // Starting with one of our previous samples let's update the camera. We'll set the field of view to 45 degrees, the far plane to 100 units, and we'll move the camera 10 units up and 20 units back from the origin
  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 300;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set( 0, 10, 20 );
  // camera.position.z = 2;

  const controls = new OrbitControls(camera, canvas);
  // We also set the target to orbit around to 5 units above the origin and then call controls.update so the controls will use the new target.
  controls.target.set(0, 5, 0);
  controls.update();

  const scene = new THREE.Scene(); // A Scene in three.js is the root of a form of scene graph. Anything you want three.js to draw needs to be added to the scene
  


  //////////////////////////////// 8. EXTRA 1: FOG ////////////////////////////////
  const color = 0xFFFFFF;  // white
  const near1 = 10;
  const far1 = 80;
  scene.fog = new THREE.Fog(color, near1, far1);


//////////////////////////////// LOADING ////////////////////////////////
  const loadingElem = document.querySelector('#loading');
  const progressBarElem = loadingElem.querySelector('.progressbar');
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);

//////////////////////////////// 1. SIMPLE SCENE ////////////////////////////////
  // Next up let's make some things to light up. First we'll make ground plane. We'll apply a tiny 2x2 pixel checkerboard texture
  // First we load the texture, set it to repeating, set the filtering to nearest, and set how many times we want it to repeat. Since the texture is a 2x2 pixel checkerboard, by repeating and setting the repeat to half the size of the plane each check on the checkerboard will be exactly 1 unit large;
  const planeSize = 60;

  const texture = loader.load('../lib/images/15_paving flagstone texture-seamless.jpg');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  const repeats = planeSize / 4;
  texture.repeat.set(repeats, repeats);

  // We then make a plane geometry, a material for the plane, and a mesh to insert it in the scene. Planes default to being in the XY plane but the ground is in the XZ plane so we rotate it.
  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
  const planeMat = new THREE.MeshPhongMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  // const mesh = new THREE.Mesh(planeGeo, planeMat);
  // mesh.rotation.x = Math.PI * -.5;
  // scene.add(mesh);

  // Let's add a cube and a sphere so we have 3 things to light including the plane
  // {
  //   const cubeSize = 4;
  //   const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  //   const cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});
  //   const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  //   mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
  //   scene.add(mesh);
  // }
  // {
  //   const sphereRadius = 3;
  //   const sphereWidthDivisions = 32;
  //   const sphereHeightDivisions = 16;
  //   const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  //   const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
  //   const mesh = new THREE.Mesh(sphereGeo, sphereMat);
  //   mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  //   scene.add(mesh);
  // }


  
  //////////////////////////////// 7. MORE 3D OBJECTS: TREES ////////////////////////////////
  function makeTree(x, z) {
    // const trunkTopRadius = .2;
    // const trunkBottomRadius = .3;
    // const trunkHeight = 2;
    // const trunkRadialSegments = 12;
    const trunkGeometry = new THREE.CylinderGeometry(
      .2, .3, 2, 12);
    const trunkMaterial = new THREE.MeshPhongMaterial({color: 'brown'});
    
    const topGeometry = new THREE.ConeGeometry(
      1.6, 4, 12);
      const topMaterial = new THREE.MeshPhongMaterial({color: 'green'});

    const root = new THREE.Object3D();
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.userData.isPickable = true;
    root.add(trunk);
   
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.userData.isPickable = true;
    top.position.y = 2 + 2 / 2;
    root.add(top);
   
    root.position.set(x, 1, z);
    root.add(top);
    scene.add(root);
  }

  for (let x = 1; x <= 20; x++) {
    if (x % 4 == 0) {
      makeTree(x+8, -15);
    }
    else if (x % 2 == 0 && x % 4 != 0) {
      makeTree(x+8, -14);
      makeTree(x+8, -17);
    }
  }

  for (let x = 1; x <= 20; x++) {
    if (x % 4 == 0) {
      makeTree(x-30, -15);
    }
    else if (x % 2 == 0 && x % 4 != 0) {
      makeTree(x-30, -14);
      makeTree(x-30, -17);
    }
  }



//////////////////////////////// 5. LIGHTING: HEMISPHERE, DIRECTIONAL, POINT ////////////////////////////////
  // Let's also make it so we can adjust the light's parameters. We'll use lil-gui again. To be able to adjust the color via lil-gui we need a small helper that presents a property to lil-gui that looks like a CSS hex color string (eg: #FF8844). Our helper will get the color from a named property, convert it to a hex string to offer to lil-gui. When lil-gui tries to set the helper's property we'll assign the result back to the light's color.
  class ColorGUIHelper {
    constructor(object, prop) {
      this.object = object;
      this.prop = prop;
    }
    get value() {
      return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
      this.object[this.prop].set(hexString);
    }
  }

  // AmbientLight
  // const color = 0xFFFFFF;
  // const intensity = 1;
  // const light = new THREE.AmbientLight(color, intensity);
  // scene.add(light);

  // HemisphereLight
  const skyColor = 0xB1E1FF;  // light blue
  const groundColor = 0xB97A20;  // brownish orange
  const hemisphereIntensity = 3;
  const hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor, hemisphereIntensity);
  scene.add(hemisphereLight);

  // DirectionalLight -- used to represent the sun
  const dirColor = 0xFFFFFF;
  const dirIntensity = 3;
  const dirLight = new THREE.DirectionalLight(dirColor, dirIntensity);
  dirLight.position.set(0, 10, 0);
  dirLight.target.position.set(-5, 0, 0);
  scene.add(dirLight);
  scene.add(dirLight.target); // Notice that we had to add the light and the light.target to the scene. A three.js DirectionalLight will shine in the direction of its target.
  
  // In this case we'll use the DirectionalLightHelper which will draw a plane, to represent the light, and a line from the light to the target. We just pass it the light and add it to the scene.
  // const helper = new THREE.DirectionalLightHelper(dirLight);
  // scene.add(helper);

  // function updateLight() {
  //   light.target.updateMatrixWorld();
  //   helper.update();
  // }

  // PointLight -- sits at a point and shoots light in all directions from that point
  const pointColor = 0xFFFFFF;
  const pointIntensity = 150;
  const pointLight = new THREE.PointLight(pointColor, pointIntensity);
  pointLight.position.set(0, 10, 0);
  scene.add(pointLight);

  // const helper = new THREE.PointLightHelper(light);
  // scene.add(helper);
  
  // While we're at it let's make it so we can set both the position of the light and the target. To do this we'll make a function that given a Vector3 will adjust its x, y, and z properties using lil-gui.
  function makeXYZGUI(gui, vector3, name, onChangeFn) {
    const folder = gui.addFolder(name);
    folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
    folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
    folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
    folder.open();
  }

  // function updateLight() {
  //   helper.update();
  // }

  const gui = new GUI();
  // gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color'); // AmbientLight

  // HemisphereLight
  const hemisphereFolder = gui.addFolder("Hemisphere Light")
  hemisphereFolder.addColor(new ColorGUIHelper(hemisphereLight, 'color'), 'value').name('skyColor');
  hemisphereFolder.addColor(new ColorGUIHelper(hemisphereLight, 'groundColor'), 'value').name('groundColor');
  hemisphereFolder.add(hemisphereLight, 'intensity', 0, 5, 0.01);

  // DirectionalLight
  const directionalFolder = gui.addFolder("Directional Light");
  directionalFolder.addColor(new ColorGUIHelper(dirLight, 'color'), 'value').name('color');
  directionalFolder.add(dirLight, 'intensity', 0, 5, 0.01);
  // gui.add(dirLight.target.position, 'x', -10, 10);
  // gui.add(dirLight.target.position, 'z', -10, 10);
  // gui.add(dirLight.target.position, 'y', 0, 10);
  makeXYZGUI(directionalFolder, dirLight.position, 'position');
  makeXYZGUI(directionalFolder, dirLight.target.position, 'target');

  // PointLight
  const pointFolder = gui.addFolder("Point Light");
  pointFolder.addColor(new ColorGUIHelper(pointLight, 'color'), 'value').name('pointColor');
  pointFolder.add(pointLight, 'intensity', 0, 250, 1);
  pointFolder.add(pointLight, 'distance', 0, 40);
  makeXYZGUI(pointFolder, pointLight.position, 'position');
  
  
  //////////////////////////////// 2. TEXTURE: LANTERN LIGHTS ON FENCE ////////////////////////////////
  // lantern from https://img.freepik.com/free-vector/geometric-groovy-pattern_23-2148850342.jpg?t=st=1741054053~exp=1741057653~hmac=33bd55756d654e28c9066b8c205b9ba33f98dc53981b1f463403a853a9efef5b&w=740
  const cubes = []; // just an array we can use to rotate the cubes
  // const loader1 = new THREE.TextureLoader();

  const texture1 = loader.load( '../lib/images/light.jpg' );
  // texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.MeshBasicMaterial({
    map: texture1,
  });

  


  //////////////////////////////// 7 (MORE). FENCE POSTS ////////////////////////////////
  function makeFence(x, z) {
    const fencePostGeometry = new THREE.CylinderGeometry(
        0.2, 0.2, 3, 12);
    const fencePostMaterial = new THREE.MeshPhongMaterial({color: 'white'});
  
      // const root = new THREE.Object3D();
      const fencePost = new THREE.Mesh(fencePostGeometry, fencePostMaterial);
      fencePost.userData.isPickable = true;
  
      fencePost.position.set(x, 1.5, z);
      scene.add(fencePost);
  }
  for (let z = 0; z < 10; z++) {
      makeFence(4, z * 2 - 5);
      makeFence(-4, z * 2 - 5);
  }
    

  // // We'll use a simple class to give lil-gui an object that it can manipulate in degrees but that will set a property in radians.
  // class DegRadHelper {
  //   constructor(obj, prop) {
  //     this.obj = obj;
  //     this.prop = prop;
  //   }
  //   get value() {
  //     return THREE.MathUtils.radToDeg(this.obj[this.prop]);
  //   }
  //   set value(v) {
  //     this.obj[this.prop] = THREE.MathUtils.degToRad(v);
  //   }
  // }

  // // We also need a class that will convert from a string like "123" into a number like 123 since three.js requires numbers for enum settings like wrapS and wrapT but lil-gui only uses strings for enums.
  // class StringToNumberHelper {
  //   constructor(obj, prop) {
  //     this.obj = obj;
  //     this.prop = prop;
  //   }
  //   get value() {
  //     return this.obj[this.prop];
  //   }
  //   set value(v) {
  //     this.obj[this.prop] = parseFloat(v);
  //   }
  // }

  // // Using those classes we can setup a simple GUI for the settings above
  // const wrapModes = {
  //   'ClampToEdgeWrapping': THREE.ClampToEdgeWrapping,
  //   'RepeatWrapping': THREE.RepeatWrapping,
  //   'MirroredRepeatWrapping': THREE.MirroredRepeatWrapping,
  // };
   
  // function updateTexture() {
  //   texture.needsUpdate = true;
  // }
   
  // const gui = new GUI();
  // gui.add(new StringToNumberHelper(texture, 'wrapS'), 'value', wrapModes)
  //   .name('texture.wrapS')
  //   .onChange(updateTexture);
  // gui.add(new StringToNumberHelper(texture, 'wrapT'), 'value', wrapModes)
  //   .name('texture.wrapT')
  //   .onChange(updateTexture);
  // gui.add(texture.repeat, 'x', 0, 5, .01).name('texture.repeat.x');
  // gui.add(texture.repeat, 'y', 0, 5, .01).name('texture.repeat.y');
  // gui.add(texture.offset, 'x', -2, 2, .01).name('texture.offset.x');
  // gui.add(texture.offset, 'y', -2, 2, .01).name('texture.offset.y');
  // gui.add(texture.center, 'x', -.5, 1.5, .01).name('texture.center.x');
  // gui.add(texture.center, 'y', -.5, 1.5, .01).name('texture.center.y');
  // gui.add(new DegRadHelper(texture, 'rotation'), 'value', -360, 360)
  //   .name('texture.rotation');

  // // The last thing to note about the example is that if you change wrapS or wrapT on the texture you must also set texture.needsUpdate so three.js knows to apply those settings. The other settings are automatically applied.



  //////////////////////////////// 6. SKYBOX ////////////////////////////////
  const loader2 = new THREE.TextureLoader();
  const texture2 = loader2.load(
    '../lib/images/kloppenheim_06_puresky.jpg',
    () => {
      texture2.mapping = THREE.EquirectangularReflectionMapping;
      texture2.colorSpace = THREE.SRGBColorSpace;
      scene.background = texture2;
    });
  


//////////////////////////////// 3. CUSTOM 3D MODEL ////////////////////////////////
  {

		const mtlLoader = new MTLLoader();
		mtlLoader.load( '../lib/models/Pagoda/Pagoda.mtl', ( mtl ) => {

			mtl.preload();
			const objLoader = new OBJLoader();
			objLoader.setMaterials( mtl );
			objLoader.load( '../lib/models/Pagoda/Pagoda.obj', ( root ) => {

        root.scale.set(0.5, 0.5, 0.5);
        root.position.set(0, 0, -15);

				scene.add( root );

			} );

		} );

	}



  //////////////////////////////// 8. EXTRA: BILLBOARDS and 7 (MORE): FOUNTAIN ////////////////////////////////
  // load fountain texture images
  const textureLoader = new THREE.TextureLoader();
  const fountainTextures = [];
  const numFrames = 14;

  for (let i = 1; i <= numFrames; i++) {
    const texture = textureLoader.load(`../lib/images/fountain/${i}.png`);
    fountainTextures.push(texture);
  }

  // fountain material
  const fountainMaterial = new THREE.SpriteMaterial({
    map: fountainTextures[0], // initialize with the first frame
    transparent: true,
    opacity: 1,
  });

  // create the fountain sprite/billboard object
  const fountain = new THREE.Sprite(fountainMaterial);
  fountain.scale.set(7, 7, 1);
  fountain.position.set(-10, 2.8, 0);
  scene.add(fountain);

  const fountain2 = new THREE.Sprite(fountainMaterial);
  fountain2.scale.set(7, 7, 1);
  fountain2.position.set(10, 2.8, 0);
  scene.add(fountain2);

  let currentFrame = 0;
  const fps = 0.1; // fps for water animation

  function updateFountainTexture() {
    // cycle through the textures
    const index = Math.floor(currentFrame) % numFrames;
    fountain.material.map = fountainTextures[index];
  }



//////////////////////////////// 8. EXTRA: PICKING ////////////////////////////////
  class PickHelper {
  
      constructor() {
  
        this.raycaster = new THREE.Raycaster();
        this.pickedObject = null;
        this.pickedObjectSavedColor = 0;
  
      }
  
      canPickObject(object) {
        return object.userData.isPickable;
      }
  
      pick( normalizedPosition, scene, camera, time ) {
  
        // restore the color if there is a picked object
        if ( this.pickedObject ) {
  
          this.pickedObject.material.emissive.setHex( this.pickedObjectSavedColor );
          this.pickedObject = undefined;
  
        }
  
        // cast a ray through the frustum
        this.raycaster.setFromCamera( normalizedPosition, camera );
        // get the list of objects the ray intersected
        const intersectedObjects = this.raycaster.intersectObjects( scene.children );
      const filteredObjects = intersectedObjects.filter(intersect => this.canPickObject(intersect.object));
      if ( filteredObjects.length ) {
  
          // pick the first object. It's the closest one
          this.pickedObject = filteredObjects[ 0 ].object;
          // save its color
          this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
          // set its emissive color to flashing red/yellow
          this.pickedObject.material.emissive.setHex( ( time * 8 ) % 2 > 1 ? 0xFFFF00 : this.pickedObjectSavedColor );
  
        }
  
      }
  
    }

  const pickPosition = { x: 0, y: 0 };
	const pickHelper = new PickHelper();
	clearPickPosition();



//////////////////////////////// LOAD MANAGER ////////////////////////////////
  loadManager.onLoad = () => {
    loadingElem.style.display = 'none';
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    scene.add(mesh);

    function makeLantern(x, z) {

      const geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6); // contains the data for a box. Almost anything we want to display in Three.js needs geometry which defines the vertices that make up our 3D object
      
      // We then create a Mesh. A Mesh in three.js represents the combination of three things
        // A Geometry (the shape of the object)
        // A Material (how to draw the object, shiny or flat, what color, what texture(s) to apply. Etc.)
        // The position, orientation, and scale of that object in the scene relative to its parent. In the code below that parent is the scene.
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(x, 3.6, z);
      scene.add(cube); // And finally we add that mesh to the scene
      
      cubes.push(cube); // add to our list of cubes to rotate
    }

    for (let z = 0; z < 10; z++) {
      makeLantern(4, z * 2 - 5);
      makeLantern(-4, z * 2 - 5);
    }
  };

  loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
    const progress = itemsLoaded / itemsTotal;
    progressBarElem.style.transform = `scaleX(${progress})`;
  };
  
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

    pickHelper.pick(pickPosition, scene, camera, time);
    
    // Finally we'll spin all 3 cubes in our render function. We compute a slightly different rotation for each one.
    cubes.forEach((cube, ndx) => {
      const speed = 0.2 + ndx * .1;
      const rot = time * speed;
      // We then set the cube's X and Y rotation to the current time. These rotations are in radians. There are 2 pi radians in a circle so our cube should turn around once on each axis in about 6.28 seconds.
      cube.rotation.x = rot;
      cube.rotation.y = rot;
    });

    // Increment the frame based on the time to control the animation speed
    currentFrame += fps * time; // Increment frame based on elapsed time

    // Update the fountain texture
    updateFountainTexture();
    
    // We can then render the scene by calling the renderer's render function and passing it the scene and the camera
    renderer.render(scene, camera);
    
    // requestAnimationFrame is a request to the browser that you want to animate something. You pass it a function to be called. In our case that function is render. The browser will call your function and if you update anything related to the display of the page the browser will re-render the page. In our case we are calling three's renderer.render function which will draw our scene.
    requestAnimationFrame(render); // We then render the scene and request another animation frame to continue our loop.
  }
  requestAnimationFrame(render); // Outside the loop we call requestAnimationFrame one time to start the loop.

  function getCanvasRelativePosition( event ) {

		const rect = canvas.getBoundingClientRect();
		return {
			x: ( event.clientX - rect.left ) * canvas.width / rect.width,
			y: ( event.clientY - rect.top ) * canvas.height / rect.height,
		};

	}

	function setPickPosition( event ) {

		const pos = getCanvasRelativePosition( event );
		pickPosition.x = ( pos.x / canvas.width ) * 2 - 1;
		pickPosition.y = ( pos.y / canvas.height ) * - 2 + 1; // note we flip Y

	}

	function clearPickPosition() {

		// unlike the mouse which always has a position
		// if the user stops touching the screen we want
		// to stop picking. For now we just pick a value
		// unlikely to pick something
		pickPosition.x = - 100000;
		pickPosition.y = - 100000;

	}

	window.addEventListener( 'mousemove', setPickPosition );
	window.addEventListener( 'mouseout', clearPickPosition );
	window.addEventListener( 'mouseleave', clearPickPosition );
}

main();