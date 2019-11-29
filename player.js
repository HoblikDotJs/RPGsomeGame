class Player {
  constructor(name, items) {
    this.name = name; // name
    this.lvl = 0;
    this.backpack = [];
    this.startingCharacter = {
      hp: 20,
      damage: 10,
      armor: 10,
      luck: 50,
      weight: 70,
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
    this.apply();
  }

  show() { // show the items 
    for (const item in this.slots) {
      if (this.slots[item].show) {
        this.slots[item].show();
      }
    }
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
    }
  }

  fightNext() {
    if (this.lvl >= enemies.length) {
      console.log("No enemies left");
    } else {
      if (this.attack(enemies[this.lvl])) {
        this.backpack.push(enemies[this.lvl].reward);
        console.log("You won " + enemies[this.lvl].reward.name);
        this.lvl++;
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