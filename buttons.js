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
  screenButtons.reloadShopBtn.html("🔄");
}

function showMonsterTime() {
  firebase.database().ref("users/" + player.name + "/times/monsters").once("value", (data) => {
    let oldTime = data.val();
    let newTime = Date.parse(new Date());
    if (newTime - oldTime > 600000) {
      screenButtons.monsterBtn.html("Ready!");
      times.monsterM = 0;
      times.monsterS = 0;
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
      screenButtons.reloadShopBtn.html("Ready!");
      times.shopM = 0;
      times.shopS = 0;
    } else {
      let time = (600000 - (newTime - oldTime)) / 1000
      times.shopM = Math.floor(time / 60);
      times.shopS = Math.floor(time - times.shopM * 60);
      screenButtons.reloadShopBtn.html(times.shopM + " : " + times.shopS);
    }
  });
}

function showArenaTime() {
  firebase.database().ref("users/" + player.name + "/times/arena").once("value", (data) => {
    let oldTime = data.val();
    let newTime = Date.parse(new Date());
    if (newTime - oldTime > 600000) {
      times.arenaS = 0;
      times.arenaM = 0;
      screenButtons.arenaBtn.html("Ready!");
    } else {
      let time = (600000 - (newTime - oldTime)) / 1000
      times.arenaM = Math.floor(time / 60);
      times.arenaS = Math.floor(time - times.arenaM * 60);
      screenButtons.arenaBtn.html(times.arenaM + " : " + times.arenaS);
    }
  });
}

function showQuestTime() {
  firebase.database().ref("users/" + player.name + "/times/quest").once("value", (data) => {
    let oldTime = data.val();
    let newTime = Date.parse(new Date());
    if (newTime - oldTime > 600000) {
      screenButtons.questBtn.html("Ready!");
      times.questS = 0;
      times.questM = 0;
    } else {
      let time = (600000 - (newTime - oldTime)) / 1000
      times.questM = Math.floor(time / 60);
      times.questS = Math.floor(time - times.questM * 60);
      screenButtons.questBtn.html(times.questM + " : " + times.questS);
    }
  });
}