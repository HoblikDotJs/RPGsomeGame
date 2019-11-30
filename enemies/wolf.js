let wolf = new Enemy("Wolf", {
  hp: 20,
  damage: 50,
  armor: 5,
  luck: 15,
  weight: 40,
  gold: 10,
}, new ChainArmor());

let giant = new Enemy("Giant", {
  hp: 200,
  damage: 300,
  armor: 15,
  luck: 10,
  weight: 700,
  gold: 20,
}, new Necklace());

let wiz = new Enemy("Wiz", {
  hp: 40,
  damage: 30,
  armor: 0,
  luck: 99,
  weight: 60,
  gold: 30
}, new EmptySlot());