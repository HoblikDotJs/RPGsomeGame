let invSelected;

function showPlayer() {
  blank();
  addBackButton();
  changeBackground("images/blank.jpg");
  invSelected = 0;
  let parent = $("<div class='container' style='margin-top:200px;'>   <div class='row' id='invent'>   </div>   <div id='invBtns' style='margin-top: 510px;'class='row'> </div>    </div>");
  $("#screen").append(parent);
  $("#invent").append($("<div class='col-lg-6' id='stats' style='position: absolute; border:solid black; height: 500px; width: 500px; '> </div>"));
  $("#invent").append($("<div class='col-lg-6' id='me' style='position: absolute; border:solid grey; height: 500px; width: 500px; margin-left: 550px;'> </div>"));
  if (player.backpack.length > 0) {
    changeInvItem();
  }
  backwardIBtn();
  putOnButton();
  forwardIBtn();
  showCharacter();
}

function showCharacter() {
  let parent = $("#me");
  parent.empty();
  parent.append($("<center><b><p style='height:45px; font-size: 25px;'>" + player.name + "</p></b></center>"));
  parent.append($("<center><p style='height:32px; font-size: 17px'>" + "Lvl : " + player.lvl + "</p></center>"));
  parent.append($("<center><p style='height:32px; font-size: 17px;'>" + "Gold : " + player.gold + " gold </p></center>"));
  for (let property in player.character) {
    parent.append($('<center><p style="height:32px; font-size: 17px " >' + con(property) + " : " + player.character[property] + '</p></center>'));
  }
  for (let slot in player.slots) {
    parent.append($("<center><p style='height:32px; font-size:17px'> " + con(slot) + " : " + player.slots[slot].name + "</p></center>"))
  }
}

function changeInvItem() {
  let parent = $("#stats");
  parent.empty();
  parent.append($("<center><b><p style='height:55px; font-size: 25px;'>" + player.backpack[invSelected].name + "</p></b></center>"));
  parent.append($("<center><p style='height:50px; font-size: 20px'>" + "Slot : " + con(player.backpack[invSelected].slot) + "</p></center>"));
  parent.append($("<center><p style='height:50px; font-size: 20px;'>" + "Price : " + player.backpack[invSelected].price + " gold </p></center>"));
  for (let property in player.backpack[invSelected].properties) {
    parent.append($('<center><p style="height:50px; font-size: 20px " >' + con(property) + " : " + player.backpack[invSelected].properties[property] + '</p></center>'));

  }
}

function forwardIBtn() {
  $("#invent").append($("<button class='btn btn-dark' style='margin-left:80px; margin-top:510px'> -> </button>").click(() => {
    invSelected++;
    if (invSelected > player.backpack.length - 1) {
      invSelected = 0;
    }
    changeInvItem();
  }));
}

function backwardIBtn() {
  $("#invent").append($("<button class='btn btn-dark' style='margin-top:510px'> <- </button>").click(() => {
    invSelected--;
    if (invSelected < 0) {
      invSelected = player.backpack.length - 1;
    }
    changeInvItem();
  }));
}

function putOnButton() {
  screenButtons.putOnBtn = $("<button class='btn btn-dark' style='margin-top:510px; margin-left:90px;'>Equip</button>").appendTo("#invent");
  screenButtons.putOnBtn.click(() => {
    player.putOn(player.backpack[invSelected]);
    changeInvItem();
    showCharacter();
  })
}