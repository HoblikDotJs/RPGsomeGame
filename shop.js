let selected;

function redirectToShop() {
  blank();
  changeBackground("blank.jpg");
  addBackButton();
  selected = 0;
  let parent = $("<div class='container' style='margin-top:200px;'>   <div class='row' id='shopItem'>   </div>   <div id='shopBtns' style='margin-top: 510px;'class='row'> </div>    </div>");
  $("#screen").append(parent);
  $("#shopItem").append($("<div class='col-lg-6' id='itemStats' style='position: absolute; border:solid black; height: 500px; width: 500px; '> </div>"));
  $("#shopItem").append($("<div class='col-lg-6' id='itemImg' style='position: absolute; border:solid grey; height: 500px; width: 500px; margin-left: 550px;'> </div>"));
  changeSelItem();
  backwardSBtn();
  reloadShopBtn();
  buyButton();
  forwardSBtn();
}

function changeSelItem() {
  let parent = $("#itemStats");
  parent.empty();
  parent.append($("<center><b><p style='height:55px; font-size: 20px;'>" + player.shopItems[selected].name + "</p></b></center>"))
  parent.append($("<center><p style='height:50px; font-size: 20px'>" + "Slot : " + con(player.shopItems[selected].slot) + "</p></center>"))
  let itemPrice = $("<center><p style='height:50px; font-size: 20px;'>" + "Price : " + player.shopItems[selected].price + " gold (Your gold: " + player.gold + ")" + "</p></center>");
  parent.append(itemPrice);
  if (player.gold >= player.shopItems[selected].price) {
    itemPrice.css('color', 'green');
  } else {
    itemPrice.css('color', 'red');
  }
  for (let property in player.shopItems[selected].properties) {
    parent.append($('<center><p style="height:50px; font-size: 20px " >' + con(property) + " : " + player.shopItems[selected].properties[property] + '</p></center>'));
  }
  if (player.shopItems[selected].sold == true) {
    itemPrice.html("SOLD").css("color", "blue").css("font-size", "30px");
  }
}

function forwardSBtn() {
  $("#shopBtns").append($("<button class='btn btn-dark' style='margin-left:300px'> -> </button>").click(() => {
    selected++;
    if (selected > player.shopItems.length - 1) {
      selected = 0;
    }
    changeSelItem();
  }));
}

function backwardSBtn() {
  $("#shopBtns").append($("<button class='btn btn-dark' style=''> <- </button>").click(() => {
    selected--;
    if (selected < 0) {
      selected = player.shopItems.length - 1;
    }
    changeSelItem();
  }));

}

function showShop() {
  player.showShop();
}


function buyButton() {
  $("#shopBtns").append($("<button class='btn btn-dark' style='margin-left:50px'>Buy</button>").appendTo("#shopBtns").click(() => {
    player.buyFromShop(selected);
  }));
}

function reloadShopBtn() {
  let reloadShopBtn = $("<button id='reloadShop' class='btn btn-dark' style='margin-left:300'>Reload</button>").appendTo("#shopBtns");
  reloadShopBtn.mouseover(showShopTime);
  reloadShopBtn.mouseout(showShopTitle)
  reloadShopBtn.click(() => {
    showShop();
  });
}