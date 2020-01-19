let player, myName;
let password, select, shopSelect;
let times = {
	monsterS: undefined,
	monsterM: undefined,
	arenaS: undefined,
	arenaM: undefined,
	shopS: undefined,
	shopM: undefined,
	questM: undefined,
	questS: undefined,
}
let screenButtons = {
	shopBtn: undefined,
	putOnBtn: undefined,
	arenaBtn: undefined,
	playerBtn: undefined,
	monsterBtn: undefined,
	fameBtn: undefined,
	questBtn: undefined,
	buyBtn: undefined,
}
let enemies = [];
let npcArr = [];

//--------------------------------------------------------------------------------------------
//                                   MAIN FUNCTION
function setup() {
	$.getJSON("weapons.json", function (json) {
		weapons = json;
		loadEnemies();
		loadNpcs();
	});
}
//----------------------------------------------------------------------------------------- 
//                                SIGN IN/UP

function onSignIn(googleUser) {
	var profile = googleUser.getBasicProfile();
	if (profile.getId()) {
		myName = prompt("Account name?");
		myName = myName.split(" ")[0];
		if (myName == undefined || myName == null || myName == "undefined" || myName == "null" || myName == "" || myName == " ") {
			printScreen("Name failed!");
			return
		}
		password = profile.getId();
		firebase.database().ref("users/" + myName).once("value").then((dataS) => {
			if (dataS.val() == undefined || dataS.val() == null) {
				let pl = new newPlayer(myName, password);
				firebase.database().ref("users/" + myName).set(pl, () => {
					printScreen("signUp was ok");
					location.reload();
				});
			} else {
				if (!myName) {
					myName = prompt("Account name?");
					myName = myName.split(" ")[0];
				}
				firebase.database().ref("users/" + myName).once("value").then((dataS) => {
					if (dataS.val().password == password) {
						player = new Player(dataS.val());
						//if signed up
						alert("Open your console with F12");
						loadWorld();
						printScreen("You've been logged as " + myName);
					}
				});
			}
		});
	}
}
//-----------------------------------------------------------------------------------------
function loadWorld() {
	$("#buttons").empty();
	emptyScreen();
	player.playFight = [];
	let parent = $("#buttons");
	screenButtons.arenaBtn = $("<button class= 'bl' id='Butt'>Arena</button>").click(arenaFight);
	screenButtons.monsterBtn = $("<button class= 'bl' id='Butt'>Monsters</button>").click(fightMonsters);
	screenButtons.playerBtn = $("<button class= 'bl' id='Butt'>Player</button>").click(showPlayer);
	screenButtons.fameBtn = $("<button class= 'bl' id='Butt'>Hall Of Fame</button>").click(showBestPlayers);
	screenButtons.questBtn = $("<button class= 'bl' id='Butt'>Quests</button>").click(showQuests);
	screenButtons.arenaBtn.hover(showArenaTime, showArenaTitle);
	screenButtons.monsterBtn.hover(showMonsterTime, showMonsterTitle);
	screenButtons.questBtn.hover(showQuestTime, showQuestTitle);
	parent.append(screenButtons.arenaBtn);
	parent.append(screenButtons.monsterBtn);
	parent.append(screenButtons.playerBtn);
	parent.append(screenButtons.fameBtn);
	parent.append(screenButtons.questBtn);
	makeSelect();
	putOnButton();
	makeShopSelect();
	buyButton();
	reloadShopBtn();
}
//-----------------------------------------------------------------------------------------
//                                     SHOW FUNCTIONS

function showArenaTitle() {
	screenButtons.arenaBtn.html("Arena");
}

function showMonsterTitle() {
	screenButtons.monsterBtn.html("Monsters");
}

function showQuestTitle() {
	screenButtons.questBtn.html("Quests");
}

function showShopTitle() {
	screenButtons.shopBtn.html("🔄");
}

/////////////////////////////////////////////////////////////////////////////////////
function showMonsterTime() {
	firebase.database().ref("users/" + player.name + "/times/monsters").once("value", (data) => {
		let oldTime = data.val();
		let newTime = Date.parse(new Date());
		if (newTime - oldTime > 600000) {
			screenButtons.monsterBtn.html("Ready!");
		} else {
			let time = (600000 - (newTime - oldTime)) / 1000;
			times.monsterM = Math.floor(time / 60);
			times.monsterS = Math.floor(time - times.monsterM * 60);
			screenButtons.monsterBtn.html(times.monsterM + " : " + times.monsterS);
		}
	})
}

function showShopTime() {
	firebase.database().ref("users/" + player.name + "/times/shop").once("value", (data) => {
		let oldTime = data.val();
		let newTime = Date.parse(new Date());
		if (newTime - oldTime > 600000) {
			screenButtons.shopBtn.html("Ready!");
		} else {
			let time = (600000 - (newTime - oldTime)) / 1000
			times.shopM = Math.floor(time / 60);
			times.shopS = Math.floor(time - times.shopM * 60);
			screenButtons.shopBtn.html(times.shopM + " : " + times.shopS);
		}
	});
}

function showQuestTime() {
	firebase.database().ref("users/" + player.name + "/times/quest").once("value", (data) => {
		let oldTime = data.val();
		let newTime = Date.parse(new Date());
		if (newTime - oldTime > 600000) {
			screenButtons.questBtn.html("Ready!");
		} else {
			let time = (600000 - (newTime - oldTime)) / 1000
			times.questM = Math.floor(time / 60);
			times.questS = Math.floor(time - times.questM * 60);
			screenButtons.questBtn.html(times.questM + " : " + times.questS);
		}
	});
}

function showArenaTime() {
	firebase.database().ref("users/" + player.name + "/times/arena").once("value", (data) => {
		let oldTime = data.val();
		let newTime = Date.parse(new Date());
		if (newTime - oldTime > 600000) {
			screenButtons.arenaBtn.html("Ready!");
		} else {
			let time = (600000 - (newTime - oldTime)) / 1000
			times.arenaM = Math.floor(time / 60);
			times.arenaS = Math.floor(time - times.arenaM * 60);
			screenButtons.arenaBtn.html(times.arenaM + " : " + times.arenaS);
		}
	});
}



//---------------------------------------------------------------------------------------
//                                       BUTTON CLICKS
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
		let bp = []; //bestPlayers
		let bpf = []; //bestPlayers fame
		if (bestPlayers[0].name) {
			bp.push(bestPlayers[0].name);
			bpf.push(bestPlayers[0].fame);
		}
		if (bestPlayers[1].name) {
			bp.push(bestPlayers[1].name);
			bpf.push(bestPlayers[1].fame);
		}
		if (bestPlayers[2].name) {
			bp.push(bestPlayers[2].name);
			bpf.push(bestPlayers[2].fame);
		}
		printScreen(bp, bpf);
	});
}

function showQuests() { // QUEST
	if ((times.questS == undefined && times.questM == undefined) || (times.questM == 0 && times.questS == 0)) {
		blank();
		player.showQuests();
		playFight();
	} else {
		blank();
		$("#buttons").append($("<button id='bb'>Back</button>").click(loadWorld));
		if (times.questM && times.questS) {
			printScreen("You need to wait " + times.questM + " : " +
				times.questS);
		} else {
			printScreen("You need to wait");
		}
	}
}

function showShop() {
	player.showShop();
	refreshShopSelect();
}

function showPlayer() {
	console.log(player.character);
	console.log("You have " + player.gold + " gold");
	console.log("You are lvl " + player.lvl);
	console.log("You have " + player.xp + " xp");
	console.log("You have " + player.fame + " fame");
	console.log(player.slots);
}
//--------------------------------------------------------------------------------------
//  												 							FIGHTING FUNCTIONS
function arenaFight() {
	blank();
	if ((times.arenaM == undefined && times.arenaS == undefined) || (times.arenaM == 0 && times.arenaS == 0)) {
		player.fightInArena();
		playFight();
	} else {
		$("#buttons").append($("<button id='bb'>Back</button>").click(loadWorld));
		if (times.arenaM && times.arenaS) {
			printScreen("You must wait " + times.arenaM + ":" + times.arenaS);
		} else {
			printScreen("You must wait");
		}
	}
}

function fightMonsters() {
	blank();
	if ((times.monsterM == undefined && times.monsterS == undefined) || (times.monsterM == 0 && times.monsterS == 0)) {
		player.fightNext();
		playFight();
	} else {
		$("#buttons").append($("<button id='bb'>Back</button>").click(loadWorld));
		if (times.monsterM && times.monsterS) {
			printScreen("You need to wait " + times.monsterM + ":" + times.monsterS);
		} else {
			printScreen("You need to wait");
		}
	}
}
//--------------------------------------------------------------------------------------------
// 																					SELECT FUNCTIONS
function makeSelect() {
	select = $("<select>").appendTo("#selector");
	select.addClass("sel");
	refreshSelect();
}

function putOnButton() {
	screenButtons.putOnBtn = $("<button>").appendTo("#selector");
	screenButtons.putOnBtn.addClass("sel");
	screenButtons.putOnBtn.html("Put on");
	screenButtons.putOnBtn.click(() => {
		let index = select.val();
		player.putOn(player.backpack[index]);
		refreshSelect();
	})
}

function refreshSelect() {
	select.empty();
	for (let i = 0; i < player.backpack.length; i++) {
		let itemName = player.backpack[i].name;
		let part = player.backpack[i].slot;
		select.append($("<option>").html(itemName + " (" + part + ")").val(i));
	}
}
//////////////////////////////////////////////////////////////
function makeShopSelect() {
	shopSelect = $("<select>").appendTo("#shopSel");
	shopSelect.addClass("sel");
	refreshShopSelect();
}

function buyButton() {
	screenButtons.buyBtn = $("<button>").appendTo("#shopSel");
	screenButtons.buyBtn.addClass("sel");
	screenButtons.buyBtn.html("Buy");
	screenButtons.buyBtn.click(() => {
		let index = shopSelect.val();
		player.buyFromShop(index);
		refreshSelect();
		refreshShopSelect();
	})
}

function reloadShopBtn() {
	screenButtons.shopBtn = $("<button>").appendTo("#shopSel");
	screenButtons.shopBtn.addClass("sel");
	screenButtons.shopBtn.html("🔄");
	screenButtons.shopBtn.hover(showShopTime, showShopTitle);
	screenButtons.shopBtn.click(() => {
		showShop();

	});
}

function refreshShopSelect() {
	shopSelect.empty();
	if (player.shopItems) {
		for (let i = 0; i < player.shopItems.length; i++) {
			let itemName = player.shopItems[i].name;
			let part = player.shopItems[i].slot;
			shopSelect.append($("<option>").html(itemName + " (" + part + ")").val(i));
		}
	}
}
//-----------------------------------------------------------------------------------------
// 																		HELPING FUNCTIONS
function printScreen(thing, fame) { //fame/bool
	if (typeof thing == "string") {
		if (fame == true || fame == undefined) {
			emptyScreen();
		}
		$("#screen").append("<p> " + thing + " </p>");
	}
	if (typeof thing == "object") {
		$("#screen").empty();
		for (let val in thing) {
			let place = parseInt(val) + 1;
			$("#screen").append("<p> " + place + " : " + thing[val] + " (" + fame[val] + ")" + " </p>");
		}
	}
}

function emptyScreen() {
	$("#screen").empty();
}

function blank() {
	$("#buttons").empty();
	$("#shopSel").empty();
	$("#selector").empty();
	$("#screen").empty();
}

let indexPlayFight = 0;
let speedPlayFight = 500;

function playFight() {
	if (player.recFight.length != 0) {
		if (indexPlayFight == 0) {
			speedPlayFight = 500;
			$("#buttons").append($("<button id='skipB'>Skip</button>").click(() => {
				speedPlayFight = 1;
			}));
		}
		let fight = player.recFight;
		player.recFight;
		printScreen(fight[indexPlayFight], false);
		indexPlayFight++;
		if (indexPlayFight != fight.length) {
			setTimeout(playFight, speedPlayFight);
		} else {
			player.recFight = [];
			indexPlayFight = 0;
			$("#buttons").empty();
			$("#buttons").append($("<button id='bb'>Back</button>").click(loadWorld));
		}
	} else {
		setTimeout(playFight, 500);
	}
}