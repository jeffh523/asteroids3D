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
	playerWidth = 12,
	playerHeight = 12,
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

var score = 0,
	collisionDetected = false,
	isGoingThroughRing = false,
	isGameOver = false;
var	gameOverTxt;
var scoreTxt,  
	msg;

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
	var playerGeom = new THREE.BoxGeometry(
			playerWidth,
			playerHeight,
			playerDepth,
			playerQuality,
			playerQuality,
			playerQuality);
	var playerGeomWing = new THREE.BoxGeometry(
			playerWidth*1.85,
			playerHeight*.5,
			playerDepth/2,
			playerQuality,
			playerQuality,
			playerQuality);
	// Merge the two player geometries into playerGeom
	THREE.GeometryUtils.merge(playerGeom, playerGeomWing);

	playerModel = new THREE.Mesh(
		playerGeom,
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

	// Create a div for showing the score
	scoreTxt = document.createElement('scoreTxt');
	scoreTxt.style.position = 'absolute';
	scoreTxt.style.width = 60;
	scoreTxt.style.height = 30;
	scoreTxt.innerHTML = 'Score';
	scoreTxt.style.top = (HEIGHT * 0.9) + 'px';
	scoreTxt.style.left = (WIDTH * 0.43) + 'px';
	scoreTxt.style.color = 'white';
	scoreTxt.style.fontSize = 32 + 'px';
	scoreTxt.style.fontWeight = 'bold';
	scoreTxt.style.padding = 10 + 'px';
	scoreTxt.setAttribute('id', 'scoreTxt');
	document.body.appendChild(scoreTxt);

	// Create a div for showing "+ 500" when going through ring
	msg = document.createElement('msg');
	msg.style.position = 'absolute';
	msg.style.width = 60;
	msg.style.height = 30;
	msg.innerHTML = '';
	msg.style.top = (HEIGHT * 0.07) + 'px';
	msg.style.left = (WIDTH * 0.43) + 'px';
	msg.style.color = 'white';
	msg.style.fontSize = 40 + 'px';
	msg.style.fontWeight = 'bold';
	msg.style.padding = 10 + 'px';
	msg.setAttribute('id', 'msg');
	document.body.appendChild(msg);
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
	else {
		moveGameOverTxt();
	}
	updateScore();
}

//Handles Key Events to update playerDX, DY, DZ
function handleKey() {
	// handle left/right move
	if (Key.isDown(Key.A))
		playerDX = -1;
	else if (Key.isDown(Key.D))
		playerDX = 1;
	else 
		playerDX = 0;
	// handle up/down move
	if (Key.isDown(Key.W))
		playerDY = 1;
	else if (Key.isDown(Key.S)) 
		playerDY = -1;
	else 
		playerDY = 0;
	// handle roll left/right
	if (Key.isDown(Key.COMMA))
		playerRotZ = -1;
	else if (Key.isDown(Key.PERIOD)) 
		playerRotZ = 1;
	else
		playerRotZ = 0;
}

// Updates playerModel position based on delta X, Y, Z
function movePlayer() {
	// rotate playerModel based on direction
	
	// Rotate for DX
	if (playerDX > 0)
		playerModel.rotation.y = Math.PI * -15/180;
	else if (playerDX < 0)
			playerModel.rotation.y = Math.PI * 15/180;
	else  // DX is 0
		playerModel.rotation.y = 0;

	// Rotate for DY
	if (playerDY > 0)
		playerModel.rotation.x = Math.PI * 15/180;
	else if (playerDY < 0)
		playerModel.rotation.x = Math.PI * -15/180;
	else  // DY is 0
		playerModel.rotation.x = 0;

	// Rotate for playerRotZ roll
	if (playerRotZ > 0)
		playerModel.rotation.z -= Math.PI * 4/180;
	else if (playerRotZ < 0)
		playerModel.rotation.z += Math.PI * 4/180;

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
				{color: 0x663300}); // Orange/Brown
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
		var sprite = sprites[i];
		sprite.position.z += spriteSpeed;
		// check this sprite for collision with player
		if (collisionCheck(sprite))
			collisionDetected = true;
		// make asteroids rotate
		if (!sprite.isPoints) 
			sprite.rotation.x += Math.PI * 2/180;
		else  // make point rings spin
			sprite.rotation.z += Math.PI * 4/180;
		// get rid of sprites that have flown past camera
		if (sprite.position.z >= 500) {
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

			var collision = (simpleDist + playerWidth/2 > sprite.rad - torusTubeDiameter/2 &&
								simpleDist - playerWidth/2 < sprite.rad + torusTubeDiameter/2);
			// boost score if player going through ring
			if (!collision && simpleDist < sprite.rad)
				isGoingThroughRing = true;
		}
	}
}

// Freezes game in current state,
// displays "Game Over" message
function gameOver() {
	isGameOver = true;

	var materialFront = new THREE.MeshBasicMaterial(
		{color: 0xFFFF00});
	var materialSide = new THREE.MeshBasicMaterial(
		{color: 0x000000});
	var materialArray = [materialFront, materialSide];
	var gameOverMaterial = new THREE.MeshFaceMaterial(
		materialArray);
	var gameOverGeom = new THREE.TextGeometry('GAME OVER', {
			size: 20,
			curveSegments: 5,
			font: 'helvetiker',
			weight: 'normal',
			style: 'normal',
			bevelThickness: 1,
			bevelSize: 1,
			bevelEnabled: true,
			material: 0,
			extrudeMaterial: 1
		});

	gameOverTxt = new THREE.Mesh(
		gameOverGeom, gameOverMaterial);

	scene.add(gameOverTxt);
	gameOverTxt.position.set(-70, 80, 200);

}

// updates score in the scoreTxt scoreTxt
function updateScore() {
	if (!isGameOver) {
		score++;
		if (isGoingThroughRing) {
			score += 500;
			// write "+ 500" on the msg div
			document.getElementById('msg').innerHTML = '+ 500!';
			// unwrite msg
			setTimeout(
				function() {
					document.getElementById('msg').innerHTML = '';
				},
				1000);
			// reset var
			isGoingThroughRing = false;
		}
	}
	document.getElementById('scoreTxt').innerHTML = "Score: " + score;
}

// moves "Game Over" text in -Z direction
// Star Wars style
function moveGameOverTxt() {
	gameOverTxt.position.z -= .5;
}