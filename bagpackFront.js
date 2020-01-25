function showPlayer() {
  blank();
  addBackButton();
  changeBackground("blank.jpg");
  console.log(player.character);
  console.log("You have " + player.gold + " gold");
  console.log("You are lvl " + player.lvl);
  console.log("You have " + player.xp + " xp");
  console.log("You have " + player.fame + " fame");
  console.log(player.slots);
  makeSelect();
  putOnButton();
}

function makeSelect() {
  select = $("<select class='btn btn-dark' >").appendTo("#selector");
  refreshSelect();
}

function putOnButton() {
  screenButtons.putOnBtn = $("<button class='btn btn-dark'> style='display: inline;'").appendTo("#selector");
  screenButtons.putOnBtn.html("Put on");
  screenButtons.putOnBtn.click(() => {
    let index = select.val();
    player.putOn(player.backpack[index]);
    refreshSelect();
  })
}

function refreshSelect() {
  select.empty();
  for (let i = 0; i < player.backpack.length; i++) {
    let itemName = player.backpack[i].name;
    let part = player.backpack[i].slot;
    select.append($("<option class='btn-dark'>").html(itemName + " (" + part + ")").val(i));
  }
}