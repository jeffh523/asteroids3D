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

var sprites = [];
	spriteMinRadius = 20,
	spriteMaxRadius = 150,
	spriteSpeed = 60;

var playerModel, spriteModel;

var score = 0;


///////////////////////////////////////////////////////

function setup() {
	createScene();
	draw();
}

function createScene() {
	var WIDTH = 1000,
	    HEIGHT = 600;

	// set up camera vars
	var VIEW_ANGLE = 45,
		ASPECT = WIDTH / HEIGHT,
		NEAR = 0.1,
		FAR = 10000;

	var c = document.getElementById("gameCanvas");

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

	c.appendChild(renderer.domElement);

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

	scene.add(playerModel);
	playerModel.position.x = 0;
	playerModel.position.y = 0;
	playerModel.position.z = 50;

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

	generateSprites();
	handleKey();
	movePlayer();
	moveSprites();
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

// Generates asteroids + other sprites at random
function generateSprites() {
	// generate random number 1 - 100
	var randNum = Math.floor(Math.random() * 
		(100 - 1 + 1)) + 1;

	// if randNum <= 40, generate a new sprite
	if (randNum <= 40) {
		// generate random X for the sprite
		var spriteX = Math.floor(Math.random() * 
			(1000 - (-1000) + 1)) + (-1000);
		// generate random Y for the sprite
		var spriteY = Math.floor(Math.random() * 
			(1000 - (-1000) + 1)) + (-1000);
		// generate random radius for sprite model
		var rad = Math.floor(Math.random() * 
			(spriteMaxRadius - spriteMinRadius + 1)) 
			+ spriteMinRadius;
		
		// assign some smaller sprites to be points instead of asteroids
		var isPoints = false;
		var spriteMaterial = new THREE.MeshLambertMaterial(
				{color: 0xCC5200,
				wireframe: true}); // Orange/Brown
		// criteria for sprite to be points:
		if (randNum % 2 == 0 && rad <= spriteMaxRadius - 20 &&
			rad >= spriteMinRadius + 20 &&
			spriteY < 300 && spriteY > -100 &&
			spriteX < 200 && spriteX > -200) {
			spriteMaterial = new THREE.MeshLambertMaterial(
				{color: 0xFF0066}); // pink
			isPoints = true;
		}

		// create the sprite model
		var sprite = new THREE.Mesh(
				new THREE.SphereGeometry(rad, 7, 7),
				spriteMaterial);
		// position the sprite at Z = -6000
		sprite.position.x = spriteX;
		sprite.position.y = spriteY;
		sprite.position.z = -6000;
		//sprite.isPoints = isPoints;

		// add the new sprite to the array
		sprites.push(sprite);
		// add sprite to the scene
		scene.add(sprite);
	}
}

// Moves sprites
function moveSprites() {
	for (var i = 0; i < sprites.length; i++) {
		sprites[i].position.z += spriteSpeed;
		// get rid of sprites that have flown past camera
		if (sprites[i].position.z >= 500) {
			sprites.splice(i, 1);
		}
	}
}
