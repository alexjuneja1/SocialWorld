(function () {

	var TwtrGlobe = this.TwtrGlobe = { },

	// Constants
	POS_X = 0,
	POS_Y = 800,
	POS_Z = 2000,
	FOV = 45,
	NEAR = 1,
	FAR = 150000,
	PI_HALF = Math.PI / 2;

	var renderer, container, camera, scene, pubnub, innerWidth, innerHeight;

  //Google Globe Variables
  var curZoomSpeed = 0;
  var zoomSpeed = 50;

  var mouse = { x: 0, y: 0 }, mouseOnDown = { x: 0, y: 0 };
  var rotation = { x: 0, y: 0 },
      target = { x: Math.PI*3/2, y: Math.PI / 6.0 },
      targetOnDown = { x: 0, y: 0 };

	/**
	 *	Initiates WebGL view with Three.js
	 */
	TwtrGlobe.init = function () {

		if (!this.supportsWebGL()) {
			window.location = '/upgrade';
			return;
		}

		var innerWidth = window.innerWidth;
		var innerHeight = window.innerHeight;

		renderer = new THREE.WebGLRenderer({ antialiasing: true });
		renderer.setSize(innerWidth, innerHeight);
		renderer.setClearColor(0x00000000, 0.0);

		container = document.getElementById('globe-container')

		camera = new THREE.PerspectiveCamera(FOV, innerWidth / innerHeight, NEAR, FAR);
		camera.position.set(POS_X, POS_Y, POS_Z);
		camera.lookAt( new THREE.Vector3(0,0,0) );

		scene = new THREE.Scene();
		scene.add(camera);

		addEarth();
		addStats();
		animate();

    container.appendChild(renderer.domElement);

    container.addEventListener('mousedown', onMouseDown, false);

    container.addEventListener('mousewheel', onMouseWheel, false);

    document.addEventListener('keydown', onDocumentKeyDown, false);

    window.addEventListener ('resize', onWindowResize);

    container.addEventListener('mouseover', function() {
      overRenderer = true;
    }, false);

    container.addEventListener('mouseout', function() {
      overRenderer = false;
    }, false);
  }

	}

	var earthMesh, beaconHolder;

	/**
	 *	Creates the Earth sphere
	 */
	function addEarth () {

	  var sphereGeometry = new THREE.SphereGeometry(600, 50, 50);

	  var shader = Shaders.earth;
	  var uniforms = THREE.UniformsUtils.clone(shader.uniforms);

	  uniforms['texture'].value = THREE.ImageUtils.loadTexture('/assets/img/world.jpg');

	  var material = new THREE.ShaderMaterial({
	    uniforms: uniforms,
	    vertexShader: shader.vertexShader,
	    fragmentShader: shader.fragmentShader
	  });

	  earthMesh = new THREE.Mesh(sphereGeometry, material);
	  scene.add(earthMesh);

	  // add an empty container for the beacons to be added to
	  beaconHolder = new THREE.Object3D();
	  earthMesh.add(beaconHolder);
	}

	var stats;

	/**
	 * Adds FPS stats view for debugging
	 */
	function addStats () {
		stats = new Stats();
		stats.setMode(0); // 0: fps, 1: ms

		stats.domElement.style.position = 'absolute';
		stats.domElement.style.right = '20px';
		stats.domElement.style.bottom = '100px';

		document.body.appendChild( stats.domElement );
	}

	/**
	 * Converts a latlong to Vector3 for use in Three.js
	 */
	function latLonToVector3 (lat, lon, height) {

		height = height ? height : 0;

	  var vector3 = new THREE.Vector3(0, 0, 0);

	  lon = lon + 10;
	  lat = lat - 2;

	  var phi = PI_HALF - lat * Math.PI / 180 - Math.PI * 0.01;
	  var theta = 2 * Math.PI - lon * Math.PI / 180 + Math.PI * 0.06;
	  var rad = 600 + height;

	  vector3.x = Math.sin(phi) * Math.cos(theta) * rad;
	  vector3.y = Math.cos(phi) * rad;
	  vector3.z = Math.sin(phi) * Math.sin(theta) * rad;

	  return vector3;
	};

	/**
	 *	Adds a Tweet to the Earth, called from TweetHud.js
	 */
	TwtrGlobe.onTweet = function (tweet) {

		// extract a latlong from the Tweet object
		var latlong = {
			lat: tweet.coordinates.coordinates[1],
			lon: tweet.coordinates.coordinates[0]
		};

		var position = latLonToVector3(latlong.lat, latlong.lon);

		addBeacon(position, tweet);
	}

	/**
	 *	Adds a beacon (line) to the surface of the Earth
	 */
	function addBeacon (position, tweet) {

		var beacon = new TweetBeacon(tweet);

	  beacon.position.x = position.x;
	  beacon.position.y = position.y;
	  beacon.position.z = position.z;
	  beacon.lookAt(earthMesh.position);
		beaconHolder.add(beacon);

		// remove beacon from scene when it expires itself
		beacon.onHide(function () {
			beaconHolder.remove(beacon);
		});
	}

	/**
	 * Render loop
	 */
	function animate () {
	  requestAnimationFrame(animate);
    if (stats) stats.begin();
    render();
    if (stats) stats.end();
	}

	/**
	 * Runs on each animation frame
	 */
	function render () {

		earthMesh.rotation.y = earthMesh.rotation.y + 0.005;

	  renderer.autoClear = false;
	  renderer.clear();
	  renderer.render( scene, camera );
	}

	/**
	 * Updates camera and rendered when browser resized
	 */
	function onWindowResize (event) {
		innerWidth = window.innerWidth;
		innerHeight = window.innerHeight;

	  camera.aspect = innerWidth / innerHeight;
	  camera.updateProjectionMatrix();
	  renderer.setSize(innerWidth, innerHeight);
	}

	/**
	 * Detects WebGL support
	 */
	TwtrGlobe.supportsWebGL = function () {
		return ( function () { try { var canvas = document.createElement( 'canvas' ); return !! window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ); } catch( e ) { return false; } } )();
	}

  /**
   * User Input GLobe Controls
  */
  function onMouseDown(event) {
    event.preventDefault();

    container.addEventListener('mousemove', onMouseMove, false);
    container.addEventListener('mouseup', onMouseUp, false);
    container.addEventListener('mouseout', onMouseOut, false);

    mouseOnDown.x = - event.clientX;
    mouseOnDown.y = event.clientY;

    targetOnDown.x = target.x;
    targetOnDown.y = target.y;

    container.style.cursor = 'move';
  }

  function onMouseMove(event) {
    mouse.x = - event.clientX;
    mouse.y = event.clientY;

    var zoomDamp = distance/1000;

    target.x = targetOnDown.x + (mouse.x - mouseOnDown.x) * 0.005 * zoomDamp;
    target.y = targetOnDown.y + (mouse.y - mouseOnDown.y) * 0.005 * zoomDamp;

    target.y = target.y > PI_HALF ? PI_HALF : target.y;
    target.y = target.y < - PI_HALF ? - PI_HALF : target.y;
  }

  function onMouseUp(event) {
    container.removeEventListener('mousemove', onMouseMove, false);
    container.removeEventListener('mouseup', onMouseUp, false);
    container.removeEventListener('mouseout', onMouseOut, false);
    container.style.cursor = 'auto';
  }

  function onMouseOut(event) {
    container.removeEventListener('mousemove', onMouseMove, false);
    container.removeEventListener('mouseup', onMouseUp, false);
    container.removeEventListener('mouseout', onMouseOut, false);
  }

  function onMouseWheel(event) {
    event.preventDefault();
    if (overRenderer) {
      zoom(event.wheelDeltaY * 0.3);
    }
    return false;
  }

  function onDocumentKeyDown(event) {
    switch (event.keyCode) {
      case 38:
        zoom(100);
        event.preventDefault();
        break;
      case 40:
        zoom(-100);
        event.preventDefault();
        break;
    }
  }

  function onWindowResize( event ) {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( container.offsetWidth, container.offsetHeight );
  }

  function zoom(delta) {
    distanceTarget -= delta;
    distanceTarget = distanceTarget > 1000 ? 1000 : distanceTarget;
    distanceTarget = distanceTarget < 350 ? 350 : distanceTarget;
  }

	return TwtrGlobe;

})().init();
