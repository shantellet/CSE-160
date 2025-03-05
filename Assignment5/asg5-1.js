import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // OrbitControls let the user spin or orbit the camera around some point
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';

function main() {

	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

	const fov = 60;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 200;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.z = 30;

	const scene = new THREE.Scene();
	scene.background = new THREE.Color( 'white' );

	// put the camera on a pole (parent it to an object)
	// so we can spin the pole to move the camera around the scene
	// const cameraPole = new THREE.Object3D();
	// scene.add( cameraPole );
	// cameraPole.add( camera );

	// {

	// 	const color = 0xFFFFFF;
	// 	const intensity = 3;
	// 	const light = new THREE.DirectionalLight( color, intensity );
	// 	light.position.set( - 1, 2, 4 );
	// 	camera.add( light );

	// }
    
    //////////////////////////////// LANTERN LIGHTS ON FENCE TEXTURE ////////////////////////////////
      // lantern from https://img.freepik.com/free-vector/geometric-groovy-pattern_23-2148850342.jpg?t=st=1741054053~exp=1741057653~hmac=33bd55756d654e28c9066b8c205b9ba33f98dc53981b1f463403a853a9efef5b&w=740
      const cubes = []; // just an array we can use to rotate the cubes
      const loader1 = new THREE.TextureLoader();
    
      const texture1 = loader1.load( 'resources/images/light.jpg' );
      // texture.colorSpace = THREE.SRGBColorSpace;
    
      const material = new THREE.MeshBasicMaterial({
        map: texture1,
      });
    
      function makeLantern(x, z) {
    
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5); // contains the data for a box. Almost anything we want to display in Three.js needs geometry which defines the vertices that make up our 3D object
        
        // We then create a Mesh. A Mesh in three.js represents the combination of three things
          // A Geometry (the shape of the object)
          // A Material (how to draw the object, shiny or flat, what color, what texture(s) to apply. Etc.)
          // The position, orientation, and scale of that object in the scene relative to its parent. In the code below that parent is the scene.
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x, 3.5, z);
        scene.add(cube); // And finally we add that mesh to the scene
        
        cubes.push(cube); // add to our list of cubes to rotate
      }
    
      for (let z = 0; z < 10; z++) {
        makeLantern(3, z * 2 - 5);
        makeLantern(-3, z * 2 - 5);
      }

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
          makeFence(3, z * 2 - 5);
          makeFence(-3, z * 2 - 5);
      }

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

	class PickHelper {

		constructor() {

			this.raycaster = new THREE.Raycaster();
			this.pickedObject = null;
			this.pickedObjectSavedColor = 0;

		}

        canPickObject(object) {
            // Example filtering logic: Pick objects by name or custom property
            return object.name === "pickableObject" || object.userData.isPickable;
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
				this.pickedObject.material.emissive.setHex( ( time * 8 ) % 2 > 1 ? 0xFFFF00 : 0xFF0000 );

			}

		}

	}

	const pickPosition = { x: 0, y: 0 };
	const pickHelper = new PickHelper();
	clearPickPosition();

	function render( time ) {

		time *= 0.001; // convert to seconds;

		if ( resizeRendererToDisplaySize( renderer ) ) {

			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

		}

		// cameraPole.rotation.y = time * .1;

		pickHelper.pick( pickPosition, scene, camera, time );

		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );

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

	window.addEventListener( 'touchstart', ( event ) => {

		// prevent the window from scrolling
		event.preventDefault();
		setPickPosition( event.touches[ 0 ] );

	}, { passive: false } );

	window.addEventListener( 'touchmove', ( event ) => {

		setPickPosition( event.touches[ 0 ] );

	} );

	window.addEventListener( 'touchend', clearPickPosition );

}

main();