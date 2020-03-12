let player, myName;
let password, select, shopSelect;
let loadingTimeout;
let indexPlayFight = 0;
let speedPlayFight = 500;
let enemies = [];
let npcArr = [];
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
	signout: undefined,
	arenaBtn: undefined,
	monsterBtn: undefined,
	playerBtn: undefined,
	putOnBtn: undefined,
	fameBtn: undefined,
	questBtn: undefined,
}
/*
TODO

	SHOP DISPLAY BUG
	1 SPELL SLOT, FIREBALL - UPGRADES //// MAGIC RESISTANCE LIKE ARMOR FOR SPELLS
	BOT only attack
	HEALING BTN WITH POTIONS - 20%HP UP (MAX / INGAME?)
	



*/

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
function loadWorld() {
	clearTimeout(loadingTimeout);
	changeBackground("images/village.jpg")
	$("#buttons").empty();
	$("#shopSel").empty();
	$("#selector").empty();
	$("#textBox").css('height', '350px');
	blank();
	player.playFight = [];
	let parent = $("#buttons");
	screenButtons.signout = $("<button class='btn btn-dark' id='signoutButt'>Sign Out</button>").click(signOut);
	screenButtons.arenaBtn = $("<button class='btn btn-dark' id='arenaButt'>Arena</button>").click(arenaFight);
	screenButtons.monsterBtn = $("<button class='btn btn-dark' id='monstersButt'>Monsters</button>").click(fightMonsters);
	screenButtons.playerBtn = $("<button class='btn btn-dark' id='playerButt'>Player</button>").click(showPlayer);
	screenButtons.fameBtn = $("<button class='btn btn-dark' id='fameButt'>Fame</button>").click(showBestPlayers);
	screenButtons.questBtn = $("<button class='btn btn-dark' id='questButt'>Quests</button>").click(showQuests);
	screenButtons.showShopBtn = $("<button class='btn btn-dark' id='showShopButt'>Shop</button>").click(redirectToShop);
	screenButtons.arenaBtn.mouseover(showArenaTime);
	screenButtons.arenaBtn.mouseout(showArenaTitle);
	screenButtons.monsterBtn.mouseover(showMonsterTime);
	screenButtons.monsterBtn.mouseout(showMonsterTitle);
	screenButtons.questBtn.mouseover(showQuestTime);
	screenButtons.questBtn.mouseout(showQuestTitle);
	parent.append(screenButtons.signout);
	parent.append(screenButtons.arenaBtn);
	parent.append(screenButtons.monsterBtn);
	parent.append(screenButtons.playerBtn);
	parent.append(screenButtons.fameBtn);
	parent.append(screenButtons.questBtn);
	parent.append(screenButtons.showShopBtn);
}
//---------------------------------------------------------------------------------------
//                                       BUTTON CLICKS

function showBestPlayers() {
	console.log("Currently unavailable :(");
	blank();
	addBackButton();
	changeBackground("images/blank.jpg");
	/*
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
	});*/
}

function showQuests() {
	firebase.database().ref("users/" + player.name + "/times/quest").once("value", (s) => {
		let oldTime = s.val();
		let newTime = Date.parse(new Date());
		if (newTime - oldTime > player.onQuest) {
			if (player.onQuest) { // player finished the quest and now its fight time!
				for (let q in player.questAvailable) {
					if (player.questAvailable[q].sel) {
						player.doQuest(player.questAvailable[q]);
					}
				}
				blank();
				changeBackground("images/blank.jpg");
				playFight(false);
			} else { // selecting a quest and quests are shown
				blank();
				changeBackground("images/blank.jpg");
				addBackButton();
				let quests;
				if (player.questAvailable.length != 3) {
					quests = randomQuests(3);
					player.questAvailable = quests;
					player.saveState();
				} else {
					quests = player.questAvailable;
				}
				let selected = 0;
				$("#screen").append($("<center><div class='container'><div id='questDiv' class='row'><div class='col-lg-8'> <ul id='questSelector' class='selectpicker' data-style='btn-dark'> </ul> </div></div></div></center>"));
				$("#questDiv").append($("<div class='col-lg-4' id='questDescription'><p id='des'>" + quests[selected].description + "</p></div>"))
				$("#questDiv").append($("<div class='col-lg-4' id='questXpDiv'><p id='xpRew'>" + quests[selected].xpReward + " xp </p></div>"));
				$("#questDiv").append($("<div class='col-lg-4' id='questTimeDiv'><p id='questTime'>" + quests[selected].time / 60000 + " min </p></div>"));
				$("#questDiv").append($("<div class='col-lg-4' id='questGoldRewDiv'><p id='goldRew'>" + quests[selected].goldReward + " gold </p></div>"))
				for (let i = 0; i < quests.length; i++) {
					$("#questSelector").append($("<li>" + quests[i].name + "</li>").click(() => {
						selected = i;
						$("#des").html(quests[selected].description);
						$("#xpRew").html(quests[selected].xpReward + " xp");
						$("#goldRew").html(quests[selected].goldReward + " gold");
						$("#questTime").html(quests[selected].time / 60000 + " min");
					}));
				}
				$("#questDescription").append($("<div class='row'><div class='col-lg-12'><button class='btn btn-dark'>GO</button></div></div>").click(() => {
					player.onQuest = quests[selected].time;
					firebase.database().ref("users/" + player.name + "/times/quest").set(Date.parse(new Date()));
					player.questAvailable[selected].sel = true;
					player.saveState();
					showQuests();
				}));
			}
		} else { // player is in quest and waiting screen is shown
			blank();
			addBackButton();
			changeBackground("images/blank.jpg");
			$("#screen").append($("<center><p id='pbTime' style=''> </p></center>"));
			$("#screen").append(progressBarCode);
			let time = (player.onQuest - (newTime - oldTime)) / 1000
			let min = Math.floor(time / 60);
			let sec = Math.floor(time - min * 60);
			let remaining = 100 - (time / (player.onQuest / 1000)) * 100;
			$("#pb").css("width", remaining + "%");
			$("#pbTime").html(min + " : " + sec);
			loadingTimeout = setTimeout(showQuests, 1000);
		}
	});
}

function arenaFight() {
	blank();
	changeBackground("blank.jpg");
	if ((times.arenaM == undefined && times.arenaS == undefined) || (times.arenaM == 0 && times.arenaS == 0)) {
		player.fightInArena();
		playFight();
	} else {
		addBackButton();
		$("#screen").append($("<center><p id='pbTime' style=''> </p></center>"));
		$("#screen").append(progressBarCode);
		let sec = times.arenaS;
		let min = times.arenaM;
		let remaining = (1 - ((min * 60 + sec) / 600)) * 100;
		$("#pb").css("width", remaining + "%");
		$("#pbTime").html(min + " : " + sec);
		loadingTimeout = setTimeout(arenaFight, 1000);
	}
}

function fightMonsters() {
	blank();
	changeBackground("images/blank.jpg");
	if ((times.monsterM == undefined && times.monsterS == undefined) || (times.monsterM == 0 && times.monsterS == 0)) {
		player.fightNext();
		playFight();
	} else {
		addBackButton();
		$("#screen").append($("<center><p id='pbTime' style=''> </p></center>"));
		$("#screen").append(progressBarCode);
		let sec = times.monsterS;
		let min = times.monsterM;
		let remaining = (1 - ((min * 60 + sec) / 3600)) * 100;
		$("#pb").css("width", remaining + "%");
		$("#pbTime").html(min + " : " + sec);
		loadingTimeout = setTimeout(fightMonsters, 1000);
	}
}

//-----------------------------------------------------------------------------------------
// 							HELPING FUNCTIONS
function printScreen(thing, deleting, fame) { //str/bool
	if (typeof thing == "string") {
		if (deleting == true || deleting == undefined) {
			emptyScreen();
		}
		$("#textBox").append("<b><p> " + thing + " </p></b>");
	}
	if (typeof thing == "object") {
		$("#textBox").empty();
		for (let val in thing) {
			let place = parseInt(val) + 1;
			$("#textBox").append("<b><p> " + place + " : " + thing[val] + " (" + fame[val] + ")" + " </p></b>");
		}
	}
}

function emptyScreen() {
	$("#screen").empty();
}

function blank() { // deletes all el.
	$("#buttons").empty();
	$("#shopSel").empty();
	$("#selector").empty();
	$("#textBox").empty();
	emptyScreen();
}

function playFight(bool) {
	let del = bool || false;
	if (player.recFight.length != 0) {
		if (indexPlayFight == 0) {
			speedPlayFight = 500;
			$("#buttons").append($("<button class='btn btn-dark' id='skipB'>Skip</button>").click(() => {
				speedPlayFight = 1;
			}));
		}
		let fight = player.recFight;
		player.recFight;
		printScreen(fight[indexPlayFight], del);
		indexPlayFight++;
		if (indexPlayFight != fight.length) {
			setTimeout(playFight, speedPlayFight);
		} else {
			player.recFight = [];
			indexPlayFight = 0;
			$("#buttons").empty();
			addBackButton();
		}
	} else {
		setTimeout(playFight, 500);
	}
}

function addBackButton() {
	$("#buttons").append($("<button class='btn btn-dark' id='bb'>Back</button>").click(loadWorld));
}

function randomQuests(num) {
	let quests = [];
	let returnList = [];
	for (quest in weapons["Quests"]) {
		quests.push(weapons["Quests"][quest]);
	}
	for (let i = 0; i < num; i++) {
		let index = Math.floor(Math.random() * quests.length);
		returnList.push(quests[index]);
		quests.splice(index, 1);
	}
	for (let j = 0; j < returnList.length; j++) {
		returnList[j].goldReward = 1 + Math.floor(Math.random() * player.lvl * 12);
		returnList[j].xpReward = Math.floor(1 + Math.random() * player.lvl * 7);
		returnList[j].time = (returnList[j].goldReward + returnList[j].xpReward) * 60000;
	}
	return returnList;
}

function changeBackground(str) {
	$("body").css("background-image", `url(${str})`);
}

function updateTimes(str) {
	firebase.database().ref("users/" + player.name + "/times").once("value", (data) => {
		if (str === "load") { // just for loading into the game 
			loadWorld();
			//	printScreen("You've been logged as " + myName);
			setInterval(updateTimes, 1000);
		}
		let serverTimes = data.val();
		let oldTime = serverTimes.monsters;
		let newTime = Date.parse(new Date());
		if (newTime - oldTime > 600000 * 6) {
			times.monsterM = 0;
			times.monsterS = 0;
		} else {
			let time = (600000 * 6 - (newTime - oldTime)) / 1000;
			times.monsterM = Math.floor(time / 60);
			times.monsterS = Math.floor(time - times.monsterM * 60);
		}
		oldTime = serverTimes.shop
		if (newTime - oldTime > 600000) {
			times.shopM = 0;
			times.shopS = 0;

		} else {
			let time = (600000 - (newTime - oldTime)) / 1000
			times.shopM = Math.floor(time / 60);
			times.shopS = Math.floor(time - times.shopM * 60);
		}
		oldTime = serverTimes.arena;
		if (newTime - oldTime > 600000) {
			times.arenaS = 0;
			times.arenaM = 0;

		} else {
			let time = (600000 - (newTime - oldTime)) / 1000
			times.arenaM = Math.floor(time / 60);
			times.arenaS = Math.floor(time - times.arenaM * 60);
		}
		oldTime = serverTimes.quest;
		if (newTime - oldTime > player.onQuest) {
			times.questS = 0;
			times.questM = 0;

		} else {
			let time = (player.onQuest - (newTime - oldTime)) / 1000
			times.questM = Math.floor(time / 60);
			times.questS = Math.floor(time - times.questM * 60);
		}
		if (times.questM == 0 && times.questS == 0 && player.onQuest) {
			screenButtons.questBtn.removeClass();
			screenButtons.questBtn.addClass("btn");
			screenButtons.questBtn.addClass("btn-success");
		} else {
			screenButtons.questBtn.addClass("btn");
			screenButtons.questBtn.addClass("btn-dark");
		}

	});
}

function con(str) {
	let string;
	switch (str) {
		case "armor":
			string = "Armor";
			break;
		case "hp":
			string = "HP";
			break;
		case "damage":
			string = "Damage";
			break;
		case "luck":
			string = "Luck";
			break;
		case "magicResistance":
			string = "Magic Resistance";
			break;
		case "regen":
			string = "Regeneration";
			break;
		case "weight":
			string = "Weight";
			break;
		case "rightArm":
			string = "Right Arm";
			break;
		case "leftArm":
			string = "Left Arm";
			break;
		case "ring":
			string = "Ring";
			break;
		case "head":
			string = "Head";
			break;
		case "body":
			string = "Body";
			break;
		case "neck":
			string = "Neck";
			break;
	}
	return string;
}