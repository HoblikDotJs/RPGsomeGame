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
  $("#reloadShop").html("Reload");
}

function showMonsterTime() {
  if (times.monsterM == 0 && times.monsterS == 0) {
    screenButtons.monsterBtn.html("Ready!");
  } else {
    screenButtons.monsterBtn.html(times.monsterM + " : " + times.monsterS);
  }
}

function showShopTime() {
  if (times.shopM == 0 && times.shopS == 0) {
    $("#reloadShop").html("Ready!");
  } else {
    $("#reloadShop").html(times.shopM + " : " + times.shopS);
  }
}

function showArenaTime() {
  if (times.arenaM == 0 && times.arenaS == 0) {
    screenButtons.arenaBtn.html("Ready!");
  } else {
    screenButtons.arenaBtn.html(times.arenaM + " : " + times.arenaS);
  }
}

function showQuestTime() {
  if (times.questM == 0 && times.questS == 0) {
    screenButtons.questBtn.html("Ready!");
  } else {
    screenButtons.questBtn.html(times.questM + " : " + times.questS);
  }
}