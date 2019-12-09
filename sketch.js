let weapons, player, enemies, myName, password, select, putOnBtn;
let logged = false;
let signedUp = false;


function setup() {
	$.getJSON("weapons.json", function (json) {
		weapons = json;
		loadEnemies();
		enemies = [wolf, wiz, giant];
	});
}

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
		document.getElementById("logButtons").removeChild(document.getElementById("up"));
		signedUp = true;
		console.log("signUp was ok");
	});
}

function loadWorld() {
	let titles = ["Arena", "Monsters", "Player", "HallOfFame"];
	let functions = [arenaFight, fightMonsters, showPlayer, showBestPlayers];
	let parent = document.getElementById("buttons");
	for (let i = 0; i < titles.length; i++) {
		let child = document.createElement("BUTTON");
		child.innerHTML = titles[i];
		child.classList.add("bl");
		child.addEventListener("click", functions[i]);
		parent.appendChild(child);
	}
	makeSelect();
	putOnButton();
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
	});
	console.log(bestPlayers);
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
	select.mouseover(refreshSelect);
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