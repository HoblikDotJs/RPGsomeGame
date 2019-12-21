function loadEnemies() {
  for (let enemy in weapons["Monsters"]) {
    enemies.push(weapons["Monsters"][enemy]);
  }
  enemies.sort((a, b) => a.lvl - b.lvl);
}