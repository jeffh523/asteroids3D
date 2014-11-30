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
	playerDZ = 0,  // forwards + backwards
	playerRotZ = 0; // Change in Z-axis rotation (barrel roll)

var sprites = [],
	spriteQuality = 7;
	spriteMinRadius = 20,
	spriteMaxRadius = 150,
	spriteSpeed = 60;

var torusTubeDiameter = 15;

var playerModel, spriteModel;

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

	if (!isGameOver) {
		generateSprites();
		handleKey();  // updates player direction
		movePlayer(); // moves player in direction
		moveSprites(); // moves sprites if no collisions
		if (collisionDetected)
			gameOver();
	}
}

//Handles Key Events to update playerDX, DY, DZ
function handleKey() {
	// handle left/right move
	if (Key.isDown(Key.A)) {
		playerDX = -1;
	} 
	else if (Key.isDown(Key.D)) {
		playerDX = 1;
	}
	else {
		playerDX = 0;
	}
	// handle up/down move
	if (Key.isDown(Key.W)) {
		playerDY = 1;
	}
	else if (Key.isDown(Key.S)) {
		playerDY = -1;
	}
	else {
		playerDY = 0;
	}
}

// Updates playerModel position based on delta X, Y, Z
function movePlayer() {
	// rotate playerModel based on direction
	
	// Rotate for DX movement{
	if (playerDX > 0) {
		playerModel.rotation.y = Math.PI * -15/180;
	}
	else if (playerDX < 0) {
			playerModel.rotation.y = Math.PI * 15/180;
	}
	else {  // DX is 0
		playerModel.rotation.y = 0;
	}

	// Rotate for DY movement
	if (playerDY > 0) {
		playerModel.rotation.x = Math.PI * 15/180;
	}
	else if (playerDY < 0) {
		playerModel.rotation.x = Math.PI * -15/180;
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
		
		// some default initial values for sprites 
		var isPoints = false;
		var spriteMaterial = new THREE.MeshLambertMaterial(
				{color: 0xCC5200}); // Orange/Brown
		var spriteGeom = new THREE.SphereGeometry(rad, spriteQuality, spriteQuality);

		// assign some sprites to be points instead of asteroids.
		// Criteria for a sprite to be points:
		if (randNum % 2 == 0 && rad <= spriteMaxRadius - 10 &&
			rad >= spriteMinRadius + 30 &&
			spriteY < 300 && spriteY > -100 &&
			spriteX < 200 && spriteX > -200) {
			spriteMaterial = new THREE.MeshLambertMaterial(
				{color: 0xFF0066});  // Pink
			isPoints = true;
			spriteGeom = new THREE.TorusGeometry(rad, torusTubeDiameter, 12, 12, Math.PI*2); // Torus
		}

		// create the sprite model
		var sprite = new THREE.Mesh(
				spriteGeom,
				spriteMaterial);
		// position the sprite at Z = -6000
		sprite.position.x = spriteX;
		sprite.position.y = spriteY;
		sprite.position.z = -6000;
		sprite.rad = rad; // this variable is for collisionCheck
		sprite.isPoints = isPoints;

		// add the new sprite to the array
		sprites.push(sprite);
		// add sprite to the scene
		scene.add(sprite);
	}
}

// Moves sprites while checking for collisions
function moveSprites() {
	for (var i = 0; i < sprites.length; i++) {
		sprites[i].position.z += spriteSpeed;
		// check this sprite for collision with player
		if (collisionCheck(sprites[i]))
			collisionDetected = true;
		// make asteroids rotate
		if (!sprites[i].isPoints)
			sprites[i].rotation.x += Math.PI * 5/180;
		// get rid of sprites that have flown past camera
		if (sprites[i].position.z >= 500) {
			sprites.splice(i, 1);
		}
	}
}

// Returns true if playerModel is colliding with 
// sprite, false otherwise. Pretty unsophisticated
// for now. Need to enhance with raycasting. Works
// surprisingly well in meantime, however.
function collisionCheck(sprite) {
	// case where sprite is an asteroid
	if (!sprite.isPoints) {
		var simpleDist = playerModel.position.distanceTo(sprite.position);
		var magicNum; // magic number (quasi-accurately) representing dist from player center to (any) player edge
		magicNum = ((playerDepth/2) + (playerWidth/2) + (playerHeight/2)) / 3;
		var gapDist = simpleDist - sprite.rad - magicNum;
		return (gapDist <= 0);
	}
	// case where sprite is points (torus)
	else {
		// collision with torus can only occur when
		// diff b/w torus.z and player.z is < playerDepth/2
		var zDiff = Math.abs(sprite.position.z - playerModel.position.z);
		if (zDiff > playerDepth / 2)
			return false;
		else {
			var simpleDist = playerModel.position.distanceTo(sprite.position);

			return (simpleDist + playerWidth/2 > sprite.rad - torusTubeDiameter/2 &&
								simpleDist - playerWidth/2 < sprite.rad + torusTubeDiameter/2);
		}
	}
}

// Freezes game in current state
function gameOver() {
	isGameOver = true;
}
