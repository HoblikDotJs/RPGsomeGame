let baseCharacter = {
  hp: 150,
  damage: 20,
  armor: 10, // heal
  luck: 50,
  weight: 70,
  regen: 1,
  magicResistance: 5
};

class newPlayer {
  constructor(name, password) {
    this.name = name;
    this.password = password;
    this.bossLvl = 0;
    this.lvl = 1;
    this.xp = 0;
    this.gold = 0;
    this.fame = 0;
    this.messages = [];
    this.character = baseCharacter;
    this.shopItems = [];
    this.upgradeCharacter = {
      hp: 0,
      damage: 0,
      armor: 0,
      luck: 0,
      weight: 0,
      regen: 0,
      magicResistance: 0,
    }

    this.slots = {
      body: weapons.body["Nothing"],
      leftArm: weapons.leftArm["Nothing"],
      rightArm: weapons.rightArm["Nothing"],
      ring: weapons.ring["Nothing"],
      neck: weapons.neck["Nothing"],
    }

    this.times = {
      arena: 0,
      monsters: 0,
      quest: 0,
      shop: 0,
    }
  }
}
class Player {
  constructor(obj) {
    this.upgradeCharacter = obj.upgradeCharacter;
    this.character = baseCharacter;
    this.gold = obj.gold;
    this.bossLvl = obj.bossLvl;
    this.lvl = obj.lvl;
    this.name = obj.name;
    this.xp = obj.xp;
    this.fame = obj.fame;
    this.password = obj.password;
    this.slots = obj.slots;
    this.backpack = obj.backpack || [];
    this.messages = obj.messages || [];
    this.shopItems = obj.shopItems;
    this.times = obj.times;
    this.readMessages();
    this.calculateCharacter();
  }

  calculateCharacter() {
    this.character = {
      hp: 150,
      damage: 20,
      armor: 10, // heal
      luck: 50,
      weight: 70,
      regen: 1,
      magicResistance: 5
    };
    for (let property in this.character) {
      this.character[property] += this.upgradeCharacter[property];
    }
    for (const item in this.slots) {
      for (const property in this.character) {
        if (this.slots[item].properties[property] && this.character[property]) {
          this.character[property] += parseInt(this.slots[item].properties[property]);
        }
      }
    }
    this.saveState();
  }
  //-------------------------------------------------------------------------------------
  //                                  SHOP
  showShop() {
    firebase.database().ref("users/" + this.name + "/times/shop").on("value", (data) => {
      let oldDate = data.val();
      let newDate = Date.parse(new Date());
      if (newDate - oldDate > 600000) {
        this.shopItems = [];
        let shoppingWeapons = [];
        for (let part in weapons) {
          for (let item in weapons[part]) {
            if (weapons[part][item].name != "Nothing" && part != "Monsters") {
              shoppingWeapons.push(weapons[part][item]);
            }
          }
        }
        for (let i = 0; i < 3; i++) {
          let randomIndex = Math.floor(Math.random() * shoppingWeapons.length);
          this.shopItems.push(shoppingWeapons[randomIndex]);
          shoppingWeapons.splice(randomIndex, 1);
        }
        this.updateShopItems();
        this.times.shop = Date.parse(new Date());
        firebase.database().ref("users/" + this.name + "/times/shop").set(this.times.shop);
      } else {
        if (shopS && shopM) {
          printScreen("You need to wait " + shopM + ":" + shopS + " for new items");
        } else {
          printScreen("You need to wait");
        }
        console.log(this.shopItems);
      }
    });
  }
  updateShopItems() {
    firebase.database().ref("users/" + this.name + "/shopItems").set(this.shopItems);
  }

  buyFromShop(index) {
    let item = this.shopItems[index];
    if (player.gold >= item.price) {
      player.gold -= item.price;
      player.backpack.push(item);
      this.shopItems.splice(index, 1);
      this.updateShopItems();
      player.saveState();
    } else {
      printScreen("you cant");
    }
  }

  updateStats(stat) {
    for (let i = 0; i < Object.keys(this.upgradeCharacter).length; i++) {
      if (Object.keys(this.upgradeCharacter)[i] == stat) {
        let price = this.upgradeCharacter[stat] * 5;
        let ans = prompt("Do you really want to update " + stat + " for " + price + " gold y/n");
        if (ans == "y" && this.gold >= price) {
          printScreen("Updating " + stat);
          this.upgradeCharacter[stat] += 2;
          this.gold -= price;
          this.saveState();
        } else {
          printScreen("Not enough gold");
        }
      }
    }
  }

  //-------------------------------------------------------------------------------------

  saveState() {
    this.lvlUp();
    firebase.database().ref("users/" + this.name + "/upgradeCharacter").set(this.upgradeCharacter);
    firebase.database().ref("users/" + this.name + "/gold").set(this.gold);
    firebase.database().ref("users/" + this.name + "/character").set(this.character);
    firebase.database().ref("users/" + this.name + "/messages").set(this.messages);
    firebase.database().ref("users/" + this.name + "/lvl").set(this.lvl);
    firebase.database().ref("users/" + this.name + "/xp").set(this.xp);
    firebase.database().ref("users/" + this.name + "/bossLvl").set(this.bossLvl);
    firebase.database().ref("users/" + this.name + "/fame").set(this.fame);
    firebase.database().ref("users/" + this.name + "/slots").set(this.slots);
    firebase.database().ref("users/" + this.name + "/backpack").set(this.backpack);
  }



  putOn(object) {
    if (this.backpack.indexOf(object) != -1) {
      let prevItem = this.slots[object.slot];
      this.slots[object.slot] = object;
      this.backpack.splice(this.backpack.indexOf(object), 1);
      this.backpack.push(prevItem);
      this.calculateCharacter();
      printScreen("You just putted " + object.name + " on.");
      console.log(this.character);
    } else {
      printScreen("You must have the item in backpack.");
      console.log(this.backpack);
    }
  }

  readMessages() {
    for (let i = 0; i < this.messages.length; i++) {
      console.log(this.messages[i]);
    }
    this.messages = [];
  }
  //-------------------------------------------------------------------------------------
  //                                FIGHTING
  fightInArena() {
    firebase.database().ref("users/" + this.name + "/times/arena").on("value", (data) => {
      let oldDate = data.val();
      let newDate = Date.parse(new Date());
      if (newDate - oldDate > 600000) {
        function pickRandomEnemy(obj, me) {
          delete obj[me];
          let names = Object.keys(obj);
          let other = Math.floor(Math.random() * names.length);
          let index = names[other];
          printScreen("Found " + index);
          return obj[index];
        }

        firebase.database().ref("users").once("value").then((u) => {
          let userObj = u.val();
          let enemy = pickRandomEnemy(userObj, this.name);
          if (this.attack(enemy)) {
            this.gold += 10;
            this.fame += 1;
            this.xp += enemy.lvl * 5;
          } else {
            firebase.database().ref("users/" + enemy.name + "/gold").transaction((gold) => {
              return gold += 10;
            });
            firebase.database().ref("users/" + enemy.name + "/fame").transaction((fame) => {
              return fame += 1;
            });
            firebase.database().ref("users/" + enemy.name + "/messages").push("You won battle with " + this.name);
          }
        });
        this.times.arena = Date.parse(new Date());
        this.saveState();
        firebase.database().ref("users/" + this.name + "/times/arena").set(this.times.arena);
      } else {
        if (arenaM && arenaS) {
          printScreen("You must wait " + arenaM + ":" + arenaS);
        } else {
          printScreen("You must wait");
        }
      }
    });
  }

  fightNext() {
    firebase.database().ref("users/" + this.name + "/times/monsters").on("value", (data) => {
      let oldDate = data.val();
      let thisDate = Date.parse(new Date());
      if (thisDate - oldDate > 600000) {
        if (this.bossLvl >= enemies.length) {
          printScreen("No enemies left");
        } else {
          if (this.attack(enemies[this.bossLvl])) {
            let drop = enemies[this.bossLvl].reward;
            let slot;
            for (let part in weapons) {
              if (weapons[part][drop]) {
                slot = part;
              }
            }
            this.backpack.push(weapons[slot][drop]);
            printScreen("You won " + enemies[this.bossLvl].reward);
            printScreen("You won " + enemies[this.bossLvl].gold + " gold");
            this.gold += enemies[this.bossLvl].gold;
            this.xp += this.bossLvl * 10;
            this.bossLvl++;
            refreshSelect();
            this.saveState();
          }
          this.times.monsters = Date.parse(new Date());
          firebase.database().ref("users/" + this.name + "/times/monsters").set(this.times.monsters);
        }
      } else {
        if (monsterS && monsterM) {
          printScreen("You need to wait " + monsterM + ":" + monsterS);
        } else {
          printScreen("You need to wait");
        }
      }
    });
  }

  attack(others) {
    let yourHp = this.character.hp;
    let othersHp = others.character.hp;
    printScreen(this.name + " attacked " + others.name);
    console.log("-----------------------------------------------------------------------------------");
    while (othersHp > 0 && yourHp > 0) {
      //  console.log(othersHp, yourHp)
      if ((Math.random() * 100) < this.character.luck / (Math.random() * 20)) {
        console.log(this.name + " regenerated " + this.character.regen + " hp");
        this.character.hp += this.character.regen;
        let critMul = Math.random() * 10;
        othersHp -= (this.character.damage - others.character.armor / 2) * critMul;
        console.log(this.name + " crit " + Math.floor((this.character.damage - others.character.armor / 2) * critMul) + " damage.")
        if (othersHp <= 0) {
          console.log(this.name + " won!");
          console.log("-----------------------------------------------------------------------------------");
          return true
        }
      } else if ((Math.random() * 100) < this.character.luck) { // luck means how many % will he hit
        othersHp -= this.character.damage - others.character.armor / 2;
        console.log(this.name + " did " + (this.character.damage - others.character.armor / 2) + " damage.");
        if (othersHp <= 0) {
          console.log(this.name + " won!");
          console.log("-----------------------------------------------------------------------------------");
          return true
        }
      } else {
        console.log(this.name + " missed");
      }
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////
      if ((Math.random() * 100) < others.character.luck / (Math.random() * 20)) {
        others.character.hp += others.character.regen;
        console.log(others.name + " regenerated " + others.character.regen + " hp");
        let critMul = Math.random() * 10;
        yourHp -= (others.character.damage - this.character.armor / 2) * critMul;
        console.log(others.name + " crit " + Math.floor((others.character.damage - this.character.armor / 2) * critMul) + " damage.")
        if (yourHp <= 0) {
          console.log(others.name + " won!");
          console.log("-----------------------------------------------------------------------------------");
          return false
        }
      } else if ((Math.random() * 100) < others.character.luck) {
        yourHp -= others.character.damage - this.character.armor / 2;
        console.log(others.name + " did " + (others.character.damage - this.character.armor / 2) + " damage.");
        if (yourHp <= 0) {
          console.log(others.name + " won!");
          console.log("-----------------------------------------------------------------------------------");
          return false
        }
      } else {
        console.log(others.name + " missed");
      }
    }
  }
  //-------------------------------------------------------------------------------------
  //                                    HELP FUNCTIONS
  lvlUp() {
    if (this.xp > Math.pow(3, this.lvl)) {
      this.xp -= Math.pow(3, this.lvl);
      this.lvl++;
      this.gold += Math.pow(2, this.lvl);
      console.log("You reached " + this.lvl + " lvl!");
      this.lvlUp();
    }
  }
}