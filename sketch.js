let monsterS, monsterM, arenaS, arenaM, weapons, shopM, shopS, player, myName
let shopBtn, password, select, putOnBtn, arenaBtn, playerBtn, monsterBtn, fameBtn;
let logged = false;
let signedUp = false;
let enemies = [];

//--------------------------------------------------------------------------------------------
//                                   MAIN FUNCTION
function setup() {
	$.getJSON("weapons.json", function (json) {
		weapons = json;
		loadEnemies();
	});
}
//----------------------------------------------------------------------------------------- 
//                                SIGN IN/UP
function signIn() {
	let myName = prompt("What is your name?");
	let password = prompt("What is your password?");
	firebase.database().ref("users/" + myName).once("value").then((dataS) => {
		if (dataS.val().password == password) {
			player = new Player(dataS.val());
			if (signedUp) {
				document.getElementById("logButtons").removeChild(document.getElementById("in"));
			} else {
				document.getElementById("logButtons").removeChild(document.getElementById("in"));
				document.getElementById("logButtons").removeChild(document.getElementById("up"));
			}
			alert("Open your console with F12");
			logged = true;
			loadWorld();
			printScreen("You've been logged as " + myName);
		} else {
			printScreen("Wrong password");
		}
	});
}

function signUp() {
	myName = prompt("What will be your name?"); // lvl
	password = prompt("What will be your password?"); //add some encryption later!!
	newPlayer = new newPlayer(myName, password); // null, undefined, magicResistance
	firebase.database().ref("users/" + myName).set(newPlayer, () => {
		document.getElementById("logButtons").removeChild(document.getElementById("up"));
		signedUp = true;
		printScreen("signUp was ok");
	});
}
//-----------------------------------------------------------------------------------------
function loadWorld() {
	let parent = $("#buttons");
	arenaBtn = $("<button class= 'bl' id='arenaId'>Arena</button>").click(arenaFight);
	monsterBtn = $("<button class= 'bl' id='monsterId'>Monsters</button>").click(fightMonsters);
	playerBtn = $("<button class= 'bl' id='arenaId'>Player</button>").click(showPlayer);
	fameBtn = $("<button class= 'bl' id='arenaId'>Hall Of Fame</button>").click(showBestPlayers);
	shopBtn = $("<button class= 'bl' id='arenaId'>Shop</button>").click(showShop);
	arenaBtn.hover(showArenaTime, showArenaTitle);
	monsterBtn.hover(showMonsterTime, showMonsterTitle);
	shopBtn.hover(showShopTime, showShopTitle);
	parent.append(arenaBtn);
	parent.append(monsterBtn);
	parent.append(playerBtn);
	parent.append(fameBtn);
	parent.append(shopBtn);
	makeSelect();
	putOnButton();
}
//-----------------------------------------------------------------------------------------
function showMonsterTime() {
	firebase.database().ref("users/" + player.name + "/times/monsters").once("value", (data) => {
		let oldTime = data.val();
		let newTime = Date.parse(new Date());
		if (newTime - oldTime > 600000) {
			monsterBtn.html("Ready!");
		} else {
			let time = (600000 - (newTime - oldTime)) / 1000;
			monsterM = Math.floor(time / 60);
			monsterS = Math.floor(time - monsterM * 60);
			monsterBtn.html(monsterM + " : " + monsterS);
		}
	})
}

function showShop() {
	player.showShop();
}

function showMonsterTitle() {
	monsterBtn.html("Monsters");
}

function showShopTitle() {
	shopBtn.html("Shop");
}

function showShopTime() {
	firebase.database().ref("users/" + player.name + "/times/shop").once("value", (data) => {
		let oldTime = data.val();
		let newTime = Date.parse(new Date());
		if (newTime - oldTime > 600000) {
			shopBtn.html("Ready!");
		} else {
			let time = (600000 - (newTime - oldTime)) / 1000
			shopM = Math.floor(time / 60);
			shopS = Math.floor(time - shopM * 60);
			shopBtn.html(shopM + " : " + shopS);
		}
	});
}


function showArenaTime() {
	firebase.database().ref("users/" + player.name + "/times/arena").once("value", (data) => {
		let oldTime = data.val();
		let newTime = Date.parse(new Date());
		if (newTime - oldTime > 600000) {
			arenaBtn.html("Ready!");
		} else {
			let time = (600000 - (newTime - oldTime)) / 1000
			arenaM = Math.floor(time / 60);
			arenaS = Math.floor(time - arenaM * 60);
			arenaBtn.html(arenaM + " : " + arenaS);
		}
	});
}

function showArenaTitle() {
	arenaBtn.html("Arena");
}

function showBestPlayers() {
	let bestPlayers = [];
	firebase.database().ref("users").on("value", function (snapshot) {
		snapshot.forEach(function (data) {
			let user = data.val();
			bestPlayers.push({
				name: user.name,
				fame: user.fame
			});
		});
		bestPlayers.sort((a, b) => {
			return b.fame - a.fame;
		});
		let bp = [];
		if (bestPlayers[0].name) {
			bp.push(bestPlayers[0].name)
		}
		if (bestPlayers[1].name) {
			bp.push(bestPlayers[1].name)
		}
		if (bestPlayers[2].name) {
			bp.push(bestPlayers[2].name)
		}
		printScreen(bp);
	});
}

function showPlayer() {
	console.log(player);
}

function arenaFight() {
	player.fightInArena();
}

function fightMonsters() {
	player.fightNext();
}

function makeSelect() {
	select = $("<select>").appendTo("#selector");
	select.addClass("sel");
	refreshSelect();
}

function putOnButton() {
	putOnBtn = $("<button>").appendTo("#selector");
	putOnBtn.addClass("sel");
	putOnBtn.html("Put on");
	putOnBtn.click(() => {
		let index = select.val();
		player.putOn(player.backpack[index]);
		refreshSelect();
	})
}

function refreshSelect() {
	select.empty();
	for (let i = 0; i < player.backpack.length; i++) {
		select.append($("<option>").html(player.backpack[i].name).val(i));
	}
}
//-----------------------------------------------------------------------------------------
// 																		HELPING FUNCTIONS
function printScreen(thing) {
	if (typeof thing == "string") {
		$("#screen").empty();
		$("#screen").append("<p> " + thing + " </p>");
	}
	if (typeof thing == "object") {
		$("#screen").empty();
		for (let val in thing) {
			$("#screen").append("<p> " + thing[val] + " </p>");
		}
	}
}