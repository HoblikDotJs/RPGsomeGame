class Enemy {
  constructor(name, character, reward) {
    this.name = name;
    this.character = character;
    if (reward) {
      this.reward = reward;
    }
  }
}

function loadEnemies() {
  for (let enemy in weapons["Monsters"]) {
    enemies.push(weapons["Monsters"][enemy]);
  }
  enemies.sort((a, b) => a.lvl - b.lvl);
}

function loadNpcs() {
  for (let npc in weapons["Npcs"]) {
    npcArr.push(weapons["Npcs"][npc]);
  }
}