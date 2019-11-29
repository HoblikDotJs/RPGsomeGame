class EmptySlot { // empty slot, used as a template for creating new items 
  constructor() { // and also as an empty item slot(no equipment)
    this.name = "Nothing in this slot";
    this.properties = {
      weight: -10,
    }
  }
}