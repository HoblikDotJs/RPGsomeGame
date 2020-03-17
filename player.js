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
    this.onQuest = false;
    this.name = name;
    this.password = password;
    this.bossLvl = parseInt(0);
    this.lvl = parseInt(1);
    this.xp = parseInt(0);
    this.gold = parseInt(0);
    this.fame = parseInt(0);
    this.messages = [];
    this.questAvailable = [];
    this.character = baseCharacter;
    let fireball = {
      "damage": 20,
      "name": "Fireball"
    }
    this.spellSlot = [fireball];
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
    this.onQuest = obj.onQuest || 0;
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
    this.spellSlot = obj.spellSlot;
    this.backpack = obj.backpack || [];
    this.messages = obj.messages || [];
    this.shopItems = obj.shopItems;
    this.times = obj.times;
    this.questAvailable = obj.questAvailable || [];
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
            if (weapons[part][item].name != "Nothing" && part != "Monsters" && part != "Quests" && part != "Npcs") {
              if (!this.backpackContains(weapons[part][item]) && !this.playerContains(weapons[part][item])) {
                shoppingWeapons.push(weapons[part][item]);
              }
            }
          }
        }
        if (shoppingWeapons.length >= 3) {
          for (let i = 0; i < 3; i++) {
            let randomIndex = Math.floor(Math.random() * shoppingWeapons.length);
            this.shopItems.push(shoppingWeapons[randomIndex]);
            shoppingWeapons.splice(randomIndex, 1);
          }
        } else {
          console.log("You cant buy anything in this moment :)");
        }
        this.updateShopItems();
        this.times.shop = Date.parse(new Date());
        firebase.database().ref("users/" + this.name + "/times/shop").set(this.times.shop);
        if (selected == 0) {
          selected = 1;
        } else {
          selected = 0;
        }
        changeSelItem();
      }
    });
  }

  updateShopItems() {
    firebase.database().ref("users/" + this.name + "/shopItems").set(this.shopItems);
  }

  buyFromShop(index) {
    let item = this.shopItems[index];
    if (item.sold == true) {
      // idk
    } else {
      if (parseInt(this.gold) >= parseInt(item.price)) {
        this.gold -= parseInt(item.price);
        this.backpack.push(item);
        this.shopItems[index].sold = true;
        this.updateShopItems();
        this.saveState();
        changeSelItem();
      }
    }
  }

  updateStats(stat) {
    for (let i = 0; i < Object.keys(this.upgradeCharacter).length; i++) {
      if (Object.keys(this.upgradeCharacter)[i] == stat) {
        let price = this.upgradeCharacter[stat] * 5;
        let ans = prompt("Do you really want to update " + stat + " for " + price + " gold y/n");
        if (ans == "y" && parseInt(this.gold) >= price) {
          console.log("Updating " + stat);
          this.upgradeCharacter[stat] += 2;
          this.gold -= parseInt(price);
          this.saveState();
        } else {
          console.log("Not enough gold");
        }
      }
    }
  }

  //-------------------------------------------------------------------------------------
  //                                        QUESTS
  doQuest(quest) {
    let NPC = this.makeNpc();
    this.attack(NPC).then((result) => {
      if (result) {
        this.xp += quest.xpReward;
        this.gold += quest.goldReward;
      } else {
        this.xp += this.lvl;
      }
    })
    this.questAvailable = randomQuests(3);
    this.onQuest = 0;
    this.saveState();
  }

  makeNpc() {
    let npcCharacter = this.character;
    for (let stat in npcCharacter) {
      npcCharacter[stat] *= Math.random() + 0.3;
      npcCharacter[stat] = Math.floor(npcCharacter[stat]);
    }
    this.calculateCharacter();
    let npcName = npcArr[Math.floor(Math.random() * npcArr.length)]
    return new Enemy(npcName, npcCharacter);
  }


  //-------------------------------------------------------------------------------------
  saveState() {
    this.lvlUp();
    firebase.database().ref("users/" + this.name + "/questAvailable").set(this.questAvailable);
    firebase.database().ref("users/" + this.name + "/onQuest").set(this.onQuest);
    firebase.database().ref("users/" + this.name + "/upgradeCharacter").set(this.upgradeCharacter);
    firebase.database().ref("users/" + this.name + "/gold").set(parseInt(this.gold));
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
    if (this.backpack.indexOf(object) != -1 && object != undefined) {
      let prevItem = this.slots[object.slot];
      this.slots[object.slot] = object;
      this.backpack.splice(this.backpack.indexOf(object), 1);
      this.backpack.push(prevItem);
      this.calculateCharacter();
      // console.log("You just putted " + object.name + " on.");
      console.log(this.character);
      console.log(this.slots);
      this.saveState();
    }
  }

  readMessages() { // TODO!!
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
          return obj[index];
        }

        firebase.database().ref("users").once("value").then((u) => {
          let userObj = u.val();
          let enemy = pickRandomEnemy(userObj, this.name);
          this.attack(enemy).then((result) => {
            if (result) {
              this.gold += 10;
              this.fame += 1;
              this.xp += enemy.lvl * 5;
              this.saveState();
            } else {
              console.log("you lost!!")
              firebase.database().ref("users/" + enemy.name + "/gold").transaction((gold) => {
                return gold += 10;
              });
              firebase.database().ref("users/" + enemy.name + "/fame").transaction((fame) => {
                return fame += 1;
              });
            }
          });
        });
        this.times.arena = Date.parse(new Date());
        this.saveState();
        firebase.database().ref("users/" + this.name + "/times/arena").set(this.times.arena);
      }
    });
  }

  fightNext() {
    firebase.database().ref("users/" + this.name + "/times/monsters").on("value", (data) => {
      let oldDate = data.val();
      let thisDate = Date.parse(new Date());
      if (thisDate - oldDate > 600000 * 6) {
        if (this.bossLvl >= enemies.length) {
          console.log("No enemies left");
        } else {
          this.attack(enemies[this.bossLvl]).then((result) => {
            if (result) {
              let drop = enemies[this.bossLvl].reward;
              let slot;
              for (let part in weapons) {
                if (weapons[part][drop]) {
                  slot = part;
                }
              }
              this.backpack.push(weapons[slot][drop]);
              console.log("You won " + enemies[this.bossLvl].reward);
              console.log("You won " + parseInt(enemies[this.bossLvl].gold) + " gold");
              this.gold += parseInt(enemies[this.bossLvl].gold);
              this.xp += this.bossLvl * 10;
              this.bossLvl++;
              this.saveState();
            }
          });
          this.times.monsters = Date.parse(new Date());
          firebase.database().ref("users/" + this.name + "/times/monsters").set(this.times.monsters);
        }
      }
    });
  }

  attack(others) { //spell regen hp
    return new Promise((resolve) => {
      let timeInterval;
      let timeOnBar = -1
      let attackBtn, regenBtn, spellBtn;
      let END = false;
      let enemy = others;
      let me = this;
      let delay = 5000;
      let timeOut = false
      let fight_round = 1
      let myHp = parseInt(me.character.hp);
      let enemyHp = parseInt(others.character.hp);
      attackButtonCreate();
      regenButtonCreate();
      spellButtonCreate();
      roundTimeBarCreate();
      myHpBarCreate();
      enemyHpBarCreate();

      function myHpBarCreate() {
        let _ = $('<div class="progress" style="width:300px; height:30px; margin: auto;margin-top:15px;"> <div class="progress-bar" id="myHpB" style="width:100%;  background-color: DarkSeaGreen; aria-valuemin ="0";aria-valuemax="100""></div></div>');
        $("#screen").append(_)
      }

      function enemyHpBarCreate() {
        let _ = $('<div class="progress" style="width:300px; height:30px; margin: auto;margin-top:15px;"> <div class="progress-bar" id="enemyHpB" style="width:100%; background-color: Crimson; aria-valuemin ="0";aria-valuemax="100""></div></div>');
        $("#screen").append(_)
      }

      function roundTimeBarCreate() {
        let _ = $('<div class="progress" style="width:300px; height:30px; margin: auto;margin-top:15px;"> <div class="progress-bar" id="roundTimeBar" style="width:100%; background-color: Gray; aria-valuemin ="0";aria-valuemax="100""></div></div>');
        $("#screen").append(_)
      }

      function regenButtonCreate() {
        regenBtn = $("<button>REGEN</button>").click(() => {
          if (!END) {
            timeOnBar = -1;
            timeInterval = clearInterval(timeInterval);
            timeOut = clearTimeout(timeOut);
            timeOut = false;
            myHp += parseInt(me.character.regen); // potions later
            console.log("REGEN HP: " + parseInt(me.character.regen));
            checkIfDead();
            enemyHit();
            checkIfDead();
            setT();
          }
        });
        $("#screen").append(regenBtn);
      }

      function spellButtonCreate() {
        spellBtn = $("<button>SPELL</button>").click(() => {
          if (!END) {
            timeOnBar = -1;
            timeInterval = clearInterval(timeInterval);
            timeOut = clearTimeout(timeOut);
            timeOut = false;
            enemyHp -= parseInt(me.spellSlot[0].damage) - parseInt(enemy.character.magicResistance) / 2;
            console.log("SPELL DMG: " + (parseInt(me.spellSlot[0].damage) - parseInt(enemy.character.magicResistance) / 2));
            checkIfDead();
            enemyHit();
            checkIfDead();
            setT();
          }
        });
        $("#screen").append(spellBtn);
      }

      function attackButtonCreate() {
        attackBtn = $("<button>ATTACK</button>").click(() => {
          if (!END) {
            timeOnBar = -1;
            timeInterval = clearInterval(timeInterval);
            timeOut = clearTimeout(timeOut);
            timeOut = false;
            let r = Math.random() * 100;
            let luck = me.character.luck;
            if (r < luck / 2) { //CRIT
              let dmg = Math.floor((parseInt(me.character.damage) - parseInt(enemy.character.armor) / 2) * (r / 100 + 1));
              if (dmg > 0) {
                enemyHp -= dmg;
                console.log("YOUR CRIT DMG: " + dmg);
              } else {
                console.log("Your DMG: " + dmg, "His AfA: " + parseInt(enemy.character.armor) / 2);
              }
            } else if (r < luck) { //NORMAL
              if (parseInt(me.character.damage) - parseInt(enemy.character.armor) / 2 > 0) {
                enemyHp -= parseInt(me.character.damage) - parseInt(enemy.character.armor) / 2;
                console.log("YOUR ATTACK DMG: " + (parseInt(me.character.damage) - parseInt(enemy.character.armor) / 2));
              } else {
                console.log("YOUR DMG: " + parseInt(me.character.damage), "His EfA: " + parseInt(enemy.character.armor) / 2)
              }
            } else { //MISS
              console.log("YOU MISSED");
            }
            checkIfDead();
            enemyHit();
            checkIfDead();
            setT();
          }
        });
        $("#screen").append(attackBtn);
      }

      function enemyHit() {
        if (!END) {
          let r = Math.random() * 100;
          let luck = enemy.character.luck;
          if (r < luck / 2) { //CRIT
            let dmg = Math.floor((parseInt(enemy.character.damage) - parseInt(me.character.armor) / 2) * (r / 100 + 1));
            if (dmg > 0) {
              myHp -= dmg;
              console.log("ENEMY CRIT DMG: " + dmg);
            } else {
              console.log("ENEMY DMG: " + dmg, "Your AfA: " + parseInt(me.character.armor) / 2);
            }
          } else if (r < luck) { //NORMAL
            if (parseInt(enemy.character.damage) - parseInt(me.character.armor) / 2 > 0) {
              myHp -= parseInt(enemy.character.damage) - parseInt(me.character.armor) / 2;
              console.log("ENEMY ATTACK DMG: " + (parseInt(enemy.character.damage) - parseInt(me.character.armor) / 2));
            } else {
              console.log("ENEMY DMG: " + parseInt(enemy.character.damage), "Your EfA: " + parseInt(me.character.armor) / 2)
            }
          } else { //MISS
            console.log("ENEMY MISSED");
          }
          fight_round += 1;
          console.log("your HP: " + myHp, "enemy HP:" + enemyHp, "round :" + fight_round);
        }
        let enemyRemainingHp = (enemyHp / enemy.character.hp) * 100
        $("#enemyHpB").css("width", enemyRemainingHp + "%")
        let myRemainingHp = (myHp / me.character.hp) * 100
        $("#myHpB").css("width", myRemainingHp + "%")
      }

      function checkIfDead() {
        if (fight_round >= 100 && !END) {
          timeInterval = clearInterval(timeInterval);
          console.log("fightRounds");
          console.log("Its a draw");
          timeOut = clearTimeout(timeOut);
          attackBtn.remove();
          regenBtn.remove();
          spellBtn.remove();
          addBackButton();
          $("#screen").append("<b><p>Maximum rounds reached</p></b>")
          END = true;
          resolve(false);
        }
        if ((myHp <= 0 || enemyHp <= 0) && !END) {
          timeInterval = clearInterval(timeInterval);
          timeOut = clearTimeout(timeOut);
          attackBtn.remove();
          regenBtn.remove();
          spellBtn.remove();
          addBackButton();
          END = true;
          if (myHp <= 0) {
            $("#screen").append("<b><p>YOU LOST</p></b>")
            console.log("You lost");
            resolve(false);
          }
          if (enemyHp <= 0) {
            $("#screen").append("<b><p>YOU WON</p></b>")
            console.log("You won");
            resolve(true);
          }
        }
      }

      function setT() {
        if (timeOut == false) {
          timeInterval = setInterval(() => {
            timeOnBar++;
            let w = 100 - ((timeOnBar / ((delay / 1000) - 1)) * 100)
            $("#roundTimeBar").css("width", w + "%");
          }, 1000);
          timeOut = setTimeout(() => {
            attackBtn.trigger("click");
          }, delay);
        }
      }
      setT();
    });
  }

  //-------------------------------------------------------------------------------------
  //                                    HELP FUNCTIONS
  lvlUp() {
    if (this.xp > Math.pow(3, this.lvl)) {
      this.xp -= Math.pow(3, this.lvl);
      this.gold += Math.pow(2, this.lvl);
      this.lvl++;
      console.log("You received " + Math.pow(2, this.lvl) + " gold!");
      console.log("You reached " + this.lvl + " lvl!");
      this.lvlUp();
    }
  }
  backpackContains(item) {
    for (let backpackItem in this.backpack) {
      if (item.name == this.backpack[backpackItem].name) {
        return true
      }
    }
    return false
  }
  playerContains(item) {
    for (let _ in this.slots[item.slot]) {
      if (item.name == this.slots[item.slot].name) {
        return true
      }
    }
    return false
  }
}

/* 
 let br = "-------------------------------------------";
    let round = 0;
    this.recFight = [];
    let yourHp = this.character.hp;
    let othersHp = others.character.hp;
    console.log(this.name + " attacked " + others.name);
    this.recFight.push(this.name + " attacked " + others.name);
    console.log(br);
    this.recFight.push(br);
    while (othersHp > 0 && yourHp > 0) {
      round++;
      if (round == 100) {
        this.recFight.push("It is a draw");
        console.log("It is a draw");
        return false
      }
      if ((Math.random() * 100) < this.character.luck / (Math.random() * 20)) {
        console.log(this.name + " regenerated " + this.character.regen + " hp");
        this.recFight.push(this.name + " regenerated " + this.character.regen + " hp");
        this.character.hp += this.character.regen;
        let critMul = Math.random() * 10;
        othersHp -= (this.character.damage - others.character.armor / 2) * critMul;
        console.log(this.name + " crit " + Math.floor((this.character.damage - others.character.armor / 2) * critMul) + " damage.");
        this.recFight.push(this.name + " crit " + Math.floor((this.character.damage - others.character.armor / 2) * critMul) + " damage.");
        if (othersHp <= 0) {
          console.log(this.name + " won!");
          this.recFight.push(this.name + " won!");
          console.log(br);
          this.recFight.push(br);
          return true
        }
      } else if ((Math.random() * 100) < this.character.luck) { // luck means how many % will he hit
        othersHp -= this.character.damage - others.character.armor / 2;
        console.log(this.name + " did " + (this.character.damage - others.character.armor / 2) + " damage.");
        this.recFight.push(this.name + " did " + (this.character.damage - others.character.armor / 2) + " damage.");
        if (othersHp <= 0) {
          console.log(this.name + " won!");
          this.recFight.push(this.name + " won!");
          console.log(br);
          this.recFight.push(br);
          return true
        }
      } else {
        console.log(this.name + " missed");
        this.recFight.push(this.name + " missed");
      }
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////
      if ((Math.random() * 100) < others.character.luck / (Math.random() * 20)) {
        others.character.hp += others.character.regen;
        console.log(others.name + " regenerated " + others.character.regen + " hp");
        this.recFight.push(others.name + " regenerated " + others.character.regen + " hp");
        let critMul = Math.random() * 10;
        yourHp -= (others.character.damage - this.character.armor / 2) * critMul;
        console.log(others.name + " crit " + Math.floor((others.character.damage - this.character.armor / 2) * critMul) + " damage.")
        this.recFight.push(others.name + " crit " + Math.floor((others.character.damage - this.character.armor / 2) * critMul) + " damage.")
        if (yourHp <= 0) {
          console.log(others.name + " won!");
          this.recFight.push(others.name + " won!");
          console.log(br);
          this.recFight.push(br);
          return false
        }
      } else if ((Math.random() * 100) < others.character.luck) {
        yourHp -= others.character.damage - this.character.armor / 2;
        console.log(others.name + " did " + (others.character.damage - this.character.armor / 2) + " damage.");
        this.recFight.push(others.name + " did " + (others.character.damage - this.character.armor / 2) + " damage.");
        if (yourHp <= 0) {
          console.log(others.name + " won!");
          this.recFight.push(others.name + " won!");
          console.log(br);
          this.recFight.push(br);
          return false
        }
      } else {
        console.log(others.name + " missed"); //
        this.recFight.push(others.name + " missed");
      }
    }
*/