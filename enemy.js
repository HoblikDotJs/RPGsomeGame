class Enemy {
  constructor(name, character, reward) {
    this.name = name;
    this.character = character;
    this.reward = reward;
  }
}

function loadEnemies() {
  for (let enemy in weapons["Monsters"]) {
    enemies.push(weapons["Monsters"][enemy]);
  }
  enemies.sort((a, b) => a.lvl - b.lvl);
}