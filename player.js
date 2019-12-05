class newPlayer {
  constructor(name, password, items) {
    this.name = name;
    this.password = password;
    this.lvl = 0;
    this.gold = 0;
    this.fame = 0;
    this.messages = [];

    this.startingCharacter = {
      hp: 25,
      damage: 20,
      armor: 5,
      luck: 50,
      weight: 70,
      regeneration: 0,
      magicResistance: 5
    }

    this.character = this.startingCharacter;

    if (items) {
      this.slots = items;
    } else {
      this.slots = { // Slots for items
        body: new EmptySlot(),
        leftArm: new EmptySlot(),
        rightArm: new EmptySlot(),
        ringFinger: new EmptySlot(),
        neck: new EmptySlot(),
      }
    }
  }

}

class Player {
  constructor(obj) {
    this.startingCharacter = obj.startingCharacter;
    this.character = this.startingCharacter;
    this.gold = obj.gold;
    this.lvl = obj.lvl;
    this.name = obj.name;
    this.fame = obj.fame;
    this.password = obj.password;
    this.slots = obj.slots;
    this.backpack = obj.backpack || [];
    this.messages = obj.messages || [];
    this.readMessages();
    this.apply();
  }



  updateStats(stat) {
    for (let i = 0; i < Object.keys(this.startingCharacter).length; i++) {
      if (Object.keys(this.startingCharacter)[i] == stat) {
        let price = this.startingCharacter[stat] * 5;
        let ans = prompt("Do you really want to update " + stat + " for " + price + " gold y/n");
        if (ans == "y" && this.gold >= price) {
          console.log("Updating " + stat);
          this.startingCharacter[stat] += 2;
          this.gold -= price;
          this.saveState();
        } else {
          console.log("Nothing");
        }
      }
    }
  }


  saveState() {
    firebase.database().ref("users/" + this.name + "/gold").set(this.gold);
    firebase.database().ref("users/" + this.name + "/character").set(this.character);
    firebase.database().ref("users/" + this.name + "/messages").set(this.messages);
    firebase.database().ref("users/" + this.name + "/lvl").set(this.lvl);
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
      this.character = this.startingCharacter;
      this.apply();
      console.log("You just putted " + object.name + " on.")
    } else {
      console.log("You must have the item in backpack.");
      console.log(this.backpack);
    }
  }

  readMessages() {
    for (let i = 0; i < this.messages.length; i++) {
      console.log(this.messages[i]);
    }
    this.messages = [];
  }



  fightInArena() {
    function pickRandomEnemy(obj, me) {
      delete obj[me];
      let names = Object.keys(obj);
      let other = Math.floor(Math.random() * names.length);
      let index = names[other];
      console.log("Found " + index);
      return obj[index];
    }
    firebase.database().ref("users").once("value").then((u) => {
      let userObj = u.val();
      let enemy = pickRandomEnemy(userObj, this.name);
      if (this.attack(enemy)) {
        this.gold += 10;
        this.fame += 1;
        this.saveState();
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
  }

  fightNext() {
    if (this.lvl >= enemies.length) {
      console.log("No enemies left");
    } else {
      if (this.attack(enemies[this.lvl])) {
        this.backpack.push(enemies[this.lvl].reward);
        console.log("You won " + enemies[this.lvl].reward.name);
        console.log("You won " + enemies[this.lvl].character.gold + " gold");
        this.lvl++;
        this.gold += enemies[this.lvl].character.gold;
      }
    }
  }

  apply() { // applies all the properties of items to the character property
    for (const item in this.slots) {
      for (const property in this.character) {
        if (this.slots[item].properties[property] && this.character[property]) {
          this.character[property] += this.slots[item].properties[property];
          // console.log("Added to " + item + " a " + property + " from " + this.slots[item].name, this.character);
        }
      }
    }
    console.log(this.slots);
    console.log(this.character);
    console.log(this.startingCharacter);
    // console.log(this.name + " ------------------------------------------------------------------------------")
  }

  attack(others) {
    let yourHp = this.character.hp;
    let othersHp = others.character.hp;
    console.log(this.name + " attacked " + others.name);
    console.log("-----------------------------------------------------------------------------------");
    while (othersHp > 0 && yourHp > 0) {
      //  console.log(othersHp, yourHp)
      if ((Math.random() * 100) < this.character.luck / (Math.random() * 20)) {
        let critMul = Math.random() * 10;
        othersHp -= (this.character.damage - others.character.armor) * critMul;
        console.log(this.name + " crit " + Math.floor((this.character.damage - others.character.armor) * critMul) + " damage.")
        if (othersHp <= 0) {
          console.log(this.name + " won!");
          console.log("-----------------------------------------------------------------------------------");
          return true
        }
      } else if ((Math.random() * 100) < this.character.luck) { // luck means how many % will he hit
        othersHp -= this.character.damage - others.character.armor;
        console.log(this.name + " did " + (this.character.damage - others.character.armor) + " damage.");
        if (othersHp <= 0) {
          console.log(this.name + " won!");
          console.log("-----------------------------------------------------------------------------------");
          return true
        }
      } else {
        console.log(this.name + " missed");
      }

      if ((Math.random() * 100) < others.character.luck / (Math.random() * 20)) {
        let critMul = Math.random() * 10;
        yourHp -= (others.character.damage - this.character.armor) * critMul;
        console.log(others.name + " crit " + Math.floor((others.character.damage - this.character.armor) * critMul) + " damage.")
        if (yourHp <= 0) {
          console.log(others.name + " won!");
          console.log("-----------------------------------------------------------------------------------");
          return false
        }
      } else if ((Math.random() * 100) < others.character.luck) {
        yourHp -= others.character.damage - this.character.armor;
        console.log(others.name + " did " + (others.character.damage - this.character.armor) + " damage.");
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

}