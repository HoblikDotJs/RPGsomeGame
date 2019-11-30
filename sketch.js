let player;
let enemies;
let myName;
let password;

function setup() {

	enemies = [wolf, giant, wiz];
	/*let playerItems = { // Slots for items
		body: new Body(),
		leftArm: new Arm(),
		rightArm: new EmptySlot(),
		ringFinger: new Ring(),
		neck: new EmptySlot(),
	}*/
	//createCanvas(600, 600); // no need to draw something
	//	player = new Player("Gary", playerItems);

}
/*
function draw() { 
	noLoop();
	background(200);
	player.show();
}*/


function signIn() {
	let myName = prompt("What is your name?");
	let password = prompt("What is your password?");
	firebase.database().ref("users/" + myName).once("value").then((dataS) => {
		if (dataS.val().password == password) {
			player = new Player(dataS.val());
			console.log("You've been logged as " + myName);
		} else {
			console.log("Wrong password");
		}
	});
}


function signUp() {
	myName = prompt("What will be your name?");
	password = prompt("What will be your password?"); //add some encryption later!!
	newPlayer = new newPlayer(myName, password);
	firebase.database().ref("users/" + myName).set(newPlayer, () => {
		console.log("signUp was ok");
	});
}