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
//                               			 SIGN IN/UP

//-----------------------------------------------------------------------------------------
function loadWorld() {
	clearTimeout(loadingTimeout);
	changeBackground("village.jpg")
	$("#buttons").empty();
	$("#shopSel").empty();
	$("#selector").empty();
	emptyScreen();
	player.playFight = [];
	let parent = $("#buttons");
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
			}
			blank();
			changeBackground("blank.jpg");
			addBackButton();
			let quests = randomQuests(3);
			let selected = 0;
			$("#screen").append($("<p id='des'>" + quests[selected].description + "</p>"))
			$("#screen").append($("<center><div> <ul id='questSelector' class='selectpicker' data-style='btn-dark'> </ul> </div></center>"));
			for (let i = 0; i < quests.length; i++) {
				$("#questSelector").append($("<li>" + quests[i].name + "</li>").click(() => {
					selected = i;
					$("#des").html(quests[selected].description);
				}));
			}
			$("#screen").append($("<button class='btn'>GO</button>").click(() => {
				player.onQuest = true;
				firebase.database().ref("users/" + player.name + "/times/quest").set(Date.parse(new Date()));
				player.saveState();
				showQuests();
			}));
		} else {
			//todo loading bar...
			blank();
			addBackButton();
			changeBackground("blank.jpg");
			let time = (600000 - (newTime - oldTime)) / 1000
			let min = Math.floor(time / 60);
			let sec = Math.floor(time - min * 60);
			printScreen(min + " : " + sec);
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
		$("#screen").append("<b><p> " + thing + " </p></b>");
	}
	if (typeof thing == "object") {
		$("#screen").empty();
		for (let val in thing) {
			let place = parseInt(val) + 1;
			$("#screen").append("<b><p> " + place + " : " + thing[val] + " (" + fame[val] + ")" + " </p></b>");
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
	emptyScreen();
}


function playFight() {
	if (player.recFight.length != 0) {
		if (indexPlayFight == 0) {
			speedPlayFight = 500;
			$("#buttons").append($("<button class='btn btn-dark' id='skipB'>Skip</button>").click(() => {
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