///////////////////////////////////////////////////////
/////////                                  ////////////
/////////         - ASTEROIDS -            ////////////
/////////    A THREE.JS PROJECT BY JEFF    ////////////
/////////                                  ////////////
///////////////////////////////////////////////////////


// set up Three.js scene vars
var renderer, scene, camera, pointLight1, pointLight2, spotLight;

// set up other global vars
var playerSpeed = 1.7,
	playerWidth = 15,
	playerHeight = 15,
	playerDepth = 30,
	playerQuality = 5,
	playerDX = 0,  // left + right
	playerDY = 0,  // up + down
	playerDZ = 0;  // forwards + backwards

var spheres = [],
	sphereQuality = 7;
	sphereMinRadius = 20,
	sphereMaxRadius = 150,
	sphereSpeed = 60;

var playerModel, sphereModel;

// one vector for each direction, for collision detection
var rays = [   
		new THREE.Vector3(0, 0, 1),   // +Z
		//new THREE.Vector3(1, 0, 1),
		new THREE.Vector3(1, 0, 0),   // >
		//new THREE.Vector3(1, 0, -1),
		new THREE.Vector3(0, 0, -1),  // -Z
		//new THREE.Vector3(-1, 0, -1),
		new THREE.Vector3(-1, 0, 0),  // <
		//new THREE.Vector3(-1, 0, 1),
		//new THREE.Vector3(0, 1, 1),
		//new THREE.Vector3(1, 1, 1),
		//new THREE.Vector3(1, 1, 0),  // 10
		//new THREE.Vector3(1, 1, -1),
		//new THREE.Vector3(0, 1, -1),
		//new THREE.Vector3(-1, 1, -1),
		//new THREE.Vector3(-1, 1, 0),
		//new THREE.Vector3(-1, 1, 1),
		new THREE.Vector3(0, 1, 0),    // ^
		//new THREE.Vector3(1, -1, 0),
		//new THREE.Vector3(0, -1, 1),
		//new THREE.Vector3(1, -1, 1),
		//new THREE.Vector3(1, -1, 0),   // 20
		//new THREE.Vector3(1, -1, -1),
		//new THREE.Vector3(0, -1, -1),
		//new THREE.Vector3(-1, -1, -1),
		//new THREE.Vector3(-1, -1, 0),
		//new THREE.Vector3(-1, -1, 1),
		new THREE.Vector3(0, -1, 0)   // \/
	];
var caster = new THREE.Raycaster();

var score = 0;
var collisionDetected = false;
var isGameOver = false;

///////////////////////////////////////////////////////

function setup() {
	createScene();
	draw();
}

function createScene() {
	var WIDTH = window.innerWidth,
	    HEIGHT = window.innerHeight;

	// set up camera vars
	var VIEW_ANGLE = 45,
		ASPECT = WIDTH / HEIGHT,
		NEAR = 0.1,
		FAR = 10000;

	renderer = new THREE.WebGLRenderer(
			{antialias: true}
		);

	camera = new THREE.PerspectiveCamera(
		VIEW_ANGLE,
		ASPECT,
		NEAR,
		FAR);

	scene = new THREE.Scene();

	scene.add(camera);

	camera.position.z = 300;
	camera.position.y = 50;

	renderer.setSize(WIDTH, HEIGHT);

	document.body.appendChild(renderer.domElement);

	// set up and position player
	var playerMaterial = 
		new THREE.MeshLambertMaterial(
			{color: 0x0047B2}); //BLUE 

	playerModel = new THREE.Mesh(
		new THREE.BoxGeometry(
			playerWidth,
			playerHeight,
			playerDepth,
			playerQuality,
			playerQuality,
			playerQuality),
		playerMaterial);
	console.log("Player vertices: ", playerModel.geometry.vertices);

	scene.add(playerModel);
	playerModel.position.x = 0;
	playerModel.position.y = 0;
	playerModel.position.z = 50;
	console.log("Player position is " , playerModel.position);

	// set up and position a point of light
	pointLight1 = new THREE.PointLight(0xF8D898);
	pointLight1.position.x = 0;
	pointLight1.position.y = 500;
	pointLight1.position.z = 1000;
	pointLight1.intensity = 3;
	pointLight1.distance = 20000;
	scene.add(pointLight1);

	// set up and position another point of light
	pointLight2 = new THREE.PointLight(0xF8D898);
	pointLight2.position.x = 0;
	pointLight2.position.y = -500;
	pointLight2.position.z = 1000;
	pointLight2.intensity = 3;
	pointLight2.distance = 20000;
	scene.add(pointLight2);
}

function draw() {	
	// loop draw function call
	requestAnimationFrame(draw);
	// draw THREE.JS scene
	renderer.render(scene, camera);

	if (!isGameOver) {
		generateSpheres();
		handleKey();  // updates player direction
		movePlayer(); // moves player in direction
		moveSpheres(); // moves spheres if no collisions
		if (collisionDetected)
			gameOver();
	}
}

//Handles Key Events to update playerDX, DY, DZ
function handleKey() {
	// handle left/right
	if (Key.isDown(Key.A)) {
		playerDX = -1;
	} 
	else if (Key.isDown(Key.D)) {
		playerDX = 1;
	}
	else {
		playerDX = 0;
	}
	// handle up/down
	if (Key.isDown(Key.W)) {
		playerDY = 1;
	}
	else if (Key.isDown(Key.S)) {
		playerDY = -1;
	}
	else {
		playerDY = 0;
	}
	
	/*
	TODO: 
	// handle forward/backward
	if (Key.isDown(Key.I)) {
		playerDZ = -1;
	}
	else if (Key.isDown(Key.K)) {var randomnumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
		playerDZ = 1;
	}
	else {
		playerDZ = 0;
	}
	*/

}

// Updates playerModel position based on delta X, Y, Z
function movePlayer() {
	
	// rotate playerModel based on direction
	// Rotate for DX movement
	if (!playerDX == 0) {
		if (playerDX > 0) {
			playerModel.rotation.y = Math.PI * -15/180;
		}
		else {
			playerModel.rotation.y = Math.PI * 15/180;
		}
	}
	else {  // DX is 0
		playerModel.rotation.y = 0;
	}
	// Rotate for DY movement
	if (!playerDY == 0) {
		if (playerDY > 0) {
			playerModel.rotation.x = Math.PI * 15/180;
		}
		else {
			playerModel.rotation.x = Math.PI * -15/180;
		}
	}
	else {  // DY is 0
		playerModel.rotation.x = 0;
	}

	playerModel.position.x += (playerDX * playerSpeed);
	playerModel.position.y += (playerDY * playerSpeed);
	playerModel.position.z += (playerDZ * playerSpeed);
}

// Generates asteroids + other spheres at random
function generateSpheres() {
	// generate random number 1 - 100
	var randNum = Math.floor(Math.random() * 
		(100 - 1 + 1)) + 1;

	// if randNum <= 40, generate a new sphere
	if (randNum <= 40) {
		// generate random X for the sphere
		var sphereX = Math.floor(Math.random() * 
			(1000 - (-1000) + 1)) + (-1000);
		// generate random Y for the sphere
		var sphereY = Math.floor(Math.random() * 
			(1000 - (-1000) + 1)) + (-1000);
		// generate random radius for sphere model
		var rad = Math.floor(Math.random() * 
			(sphereMaxRadius - sphereMinRadius + 1)) 
			+ sphereMinRadius;
		
		// assign some smaller spheres to be points instead of asteroids
		var isPoints = false;
		var sphereMaterial = new THREE.MeshLambertMaterial(
				{color: 0xCC5200}); // Orange/Brown
		// criteria for sphere to be points:
		if (randNum % 2 == 0 && rad <= sphereMaxRadius - 20 &&
			rad >= sphereMinRadius + 20 &&
			sphereY < 300 && sphereY > -100 &&
			sphereX < 200 && sphereX > -200) {
			sphereMaterial = new THREE.MeshLambertMaterial(
				{color: 0xFF0066});  // pink
			isPoints = true;
		}

		// create the sphere model
		var sphere = new THREE.Mesh(
				new THREE.SphereGeometry(rad, sphereQuality, sphereQuality),
				sphereMaterial);
		// position the sphere at Z = -6000
		sphere.position.x = sphereX;
		sphere.position.y = sphereY;
		sphere.position.z = -6000;
		sphere.rotation.z = 15;
		sphere.rotation.x = 15;
		sphere.rad = rad;
		//sphere.isPoints = isPoints;

		// add the new sphere to the array
		spheres.push(sphere);
		// add sphere to the scene
		scene.add(sphere);
	}
}

// Moves spheres while checking for collisions
function moveSpheres() {
	for (var i = 0; i < spheres.length; i++) {
		spheres[i].position.z += sphereSpeed;
		// check this sphere for collision with player
		if (collisionCheck(spheres[i]))
			collisionDetected = true;
		// get rid of spheres that have flown past camera
		if (spheres[i].position.z >= 500) {
			spheres.splice(i, 1);
		}
	}
}

// Returns true if playerModel is colliding with 
// obstacle, false otherwise. Pretty unsophisticated
// for now. Need to enhance with raycasting. Works
// surprisingly well in meantime, however.
function collisionCheck(sphereObstacle) {
	var simpleDist = playerModel.position.distanceTo(sphereObstacle.position);
	var magicNum; // magic number (falsely) representing dist from player center to (any) player edge
	magicNum = ((playerDepth/2) + (playerWidth/2) + (playerHeight/2)) / 3;
	var gapDist = simpleDist - sphereObstacle.rad - magicNum;
	console.log(gapDist);
	return (gapDist <= 0);
}

// Freezes game in current state
function gameOver() {
	playerDX = 0;
	playerDY = 0;
	playerDZ = 0;

	isGameOver = true;
}
