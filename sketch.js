let player;
let enemies;

function setup() {
	enemies = [wolf, giant, wiz];
	let playerItems = { // Slots for items
		body: new Body(),
		leftArm: new Arm(),
		rightArm: new EmptySlot(),
		ringFinger: new Ring(),
		neck: new EmptySlot(),
	}
	//createCanvas(600, 600); // no need to draw something
	player = new Player("Gary", playerItems);

}
/*
function draw() { 
	noLoop();
	background(200);
	player.show();
}*/