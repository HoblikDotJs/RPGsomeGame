let selected;

function redirectToShop() {
  blank();
  changeBackground("images/shop.jpg");
  addBackButton();
  $("#textBox").css('height', '1px');
  selected = 0;
  let parent = $("<div class='container' style='margin-top:225px;'><div class='row' id='shopItem'></div><div id='shopBtns'style='margin-top:572px;'class='row'></div></div>");
  $("#screen").append(parent);
  $("#shopItem").append($("<div class='col-lg-6' id='itemStats' style='position: absolute;  height: 560px; width: 560px;margin-left:-80px '> </div>"));
  $("#shopItem").append($("<div class='col-lg-6' id='itemImg' style='position: absolute;  height: 560px; width: 560px; margin-left: 635px;'> </div>"));
  changeSelItem();
  backwardSBtn();
  reloadShopBtn();
  buyButton();
  forwardSBtn();
}

function changeSelItem() {
  let parent = $("#itemStats").css("color", "white");
  parent.empty();
  let titleColor;
  let itemPriceValue = player.shopItems[selected].price
  let itemName = player.shopItems[selected].name
  let itemSlot = con(player.shopItems[selected].slot)

  if (player.shopItems[selected].price >= 10000) {
    titleColor = "Tomato"
  } else {
    titleColor = "White"
  }
  if (player.shopItems[selected].price >= 100000) {
    titleColor = "MediumSpringGreen"
  }
  if (player.shopItems[selected].price >= 500000) {
    titleColor = "DeepPink"
  }

  let itemTitleHTML = $("<center><b><p style='height:65px; font-size: 40px; margin-top:15px;'>" + itemName + "</p></b></center>")
  parent.append(itemTitleHTML.css("color", titleColor))

  let itemSlotHTML = $("<center><p style='height:52px; font-size: 29px'>" + "Slot: " + itemSlot + "</p></center>")
  parent.append(itemSlotHTML)

  let itemPriceHTML = $("<center><p style='height:52px; font-size: 29px'>" + "Price: " + itemPriceValue + " gold <center>");
  parent.append(itemPriceHTML);

  if (player.gold >= player.shopItems[selected].price) {
    itemPriceHTML.css('color', 'Chartreuse');
  } else {
    itemPriceHTML.css('color', 'red');
  }

  for (let property in player.shopItems[selected].properties) {
    let propertyVal = player.shopItems[selected].properties[property]
    parent.append($('<center><p style="height:52px; font-size: 29px " >' + con(property) + ": " + propertyVal + '</p></center>'));
  }

  if (player.shopItems[selected].sold == true) {
    itemPriceHTML.html("SOLD").css("color", "red").css("font-size", "29px").css("height", "52px");
  }
}

function forwardSBtn() {
  $("#shopBtns").append($("<button class='btn btn-dark' style='margin-left:1080px'> -> </button>").css('position', 'absolute').click(() => {
    selected++;
    if (selected > player.shopItems.length - 1) {
      selected = 0;
    }
    changeSelItem();
  }));
}

function backwardSBtn() {
  $("#shopBtns").append($("<button class='btn btn-dark' style='margin-left:-82px'> <- </button>").click(() => {
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
  $("#shopBtns").append($("<button class='btn btn-dark' style='margin-left:147px'>Buy</button>").appendTo("#shopBtns").click(() => {
    player.buyFromShop(selected);
  }));
}

function reloadShopBtn() {
  let reloadShopBtn = $("<button id='reloadShop' class='btn btn-dark' style='margin-left:335'>Reload</button>").appendTo("#shopBtns");
  reloadShopBtn.mouseover(showShopTime);
  reloadShopBtn.mouseout(showShopTitle)
  reloadShopBtn.click(() => {
    showShop();
  });
}