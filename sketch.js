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
	showShopBtn: undefined,
	reloadShopBtn: undefined,
	putOnBtn: undefined,
	arenaBtn: undefined,
	playerBtn: undefined,
	monsterBtn: undefined,
	fameBtn: undefined,
	questBtn: undefined,
	buyBtn: undefined,
	signout: undefined,
}

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
	changeBackground("village.jpg")
	$("#buttons").empty();
	$("#shopSel").empty();
	$("#selector").empty();
	blank();
	player.playFight = [];
	let parent = $("#buttons");
	screenButtons.signout = $("<button class='btn btn-dark' id='signoutButt'>Sign Out</button>").click(signOut);
	screenButtons.arenaBtn = $("<button class='btn btn-dark' id='arenaButt'>Arena</button>").click(arenaFight);
	screenButtons.monsterBtn = $("<button class='btn btn-dark' id='monstersButt'>Monsters</button>").click(fightMonsters);
	screenButtons.playerBtn = $("<button class='btn btn-dark' id='playerButt'>Player</button>").click(showPlayer);
	screenButtons.fameBtn = $("<button class='btn btn-dark' id='fameButt'>Hall Of Fame</button>").click(showBestPlayers);
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
	changeBackground("blank.jpg");
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
		if (newTime - oldTime > 600000) {
			if (player.onQuest) {
				player.doQuest();
				blank();
				changeBackground("blank.jpg");
				addBackButton();
				playFight(false);
			} else {
				blank();
				changeBackground("blank.jpg");
				addBackButton();
				let quests = randomQuests(3);
				let selected = 0;
				$("#screen").append($("<center><div class='container'><div id='questDiv'class='row'><div class='col-lg-8'> <ul id='questSelector' class='selectpicker' data-style='btn-dark'> </ul> </div></div></div></center>"));
				$("#questDiv").append($("<div class='col-lg-4' id='questDescription'><p id='des'>" + quests[selected].description + "</p></div>"))
				for (let i = 0; i < quests.length; i++) {
					$("#questSelector").append($("<li>" + quests[i].name + "</li>").click(() => {
						selected = i;
						$("#des").html(quests[selected].description);
					}));
				}
				$("#questDescription").append($("<div class='row'><div class='col-lg-12'><button class='btn btn-dark'>GO</button></div></div>").click(() => {
					player.onQuest = true;
					firebase.database().ref("users/" + player.name + "/times/quest").set(Date.parse(new Date()));
					player.saveState();
					showQuests();
				}));
			}
		} else {
			blank();
			addBackButton();
			changeBackground("blank.jpg");
			$("#screen").append(progressBarCode);
			let time = (600000 - (newTime - oldTime)) / 1000
			let min = Math.floor(time / 60);
			let sec = Math.floor(time - min * 60);
			let remaining = 100 - (time / 600) * 100;
			$("#pb").css("width", remaining + "%");
			$("#pb").html(min + " : " + sec);
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
		if (times.arenaM && times.arenaS) {
			printScreen("You must wait " + times.arenaM + ":" + times.arenaS);
		} else {
			printScreen("You must wait");
		}
	}
}

function fightMonsters() {
	blank();
	changeBackground("blank.jpg");
	if ((times.monsterM == undefined && times.monsterS == undefined) || (times.monsterM == 0 && times.monsterS == 0)) {
		player.fightNext();
		playFight();
	} else {
		addBackButton();
		if (times.monsterM && times.monsterS) {
			printScreen("You need to wait " + times.monsterM + ":" + times.monsterS);
		} else {
			printScreen("You need to wait");
		}
	}
}

//-----------------------------------------------------------------------------------------
// 																		HELPING FUNCTIONS
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
	return returnList;
}

function changeBackground(str) {
	$("body").css("background-image", `url(${str})`);
}


let progressBarCode = '<div class="progress" style="width:400px"> <div class="progress-bar bg-dark" id="pb" style="width:0% aria-valuemin ="0"aria-valuemax="100""></div> </div>'

function updateTimes(str) {
	firebase.database().ref("users/" + player.name + "/times").once("value", (data) => {
		if (str === "load") { // just for loading into the game 
			loadWorld();
			printScreen("You've been logged as " + myName);
			setInterval(updateTimes, 1000);
		}
		let serverTimes = data.val();
		let oldTime = serverTimes.monsters;
		let newTime = Date.parse(new Date());
		if (newTime - oldTime > 600000) {
			times.monsterM = 0;
			times.monsterS = 0;
		} else {
			let time = (600000 - (newTime - oldTime)) / 1000;
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
		if (newTime - oldTime > 600000) {
			times.questS = 0;
			times.questM = 0;

		} else {
			let time = (600000 - (newTime - oldTime)) / 1000
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