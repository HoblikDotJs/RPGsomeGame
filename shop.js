function redirectToShop() {
  blank();
  changeBackground("blank.jpg");
  addBackButton();
  reloadShopBtn();
  makeShopSelect();
  buyButton();
  if (player.shopItems == undefined) {
    console.log("empty thingy")
    showShop();
  }
}

function showShop() {
  player.showShop();
  refreshShopSelect();
}

function makeShopSelect() {
  shopSelect = $("<select class='btn btn-dark'>").appendTo("#shopSel");
  refreshShopSelect();
}

function buyButton() {
  screenButtons.buyBtn = $("<button class='btn btn-dark'>").appendTo("#shopSel");
  screenButtons.buyBtn.html("Buy");
  screenButtons.buyBtn.click(() => {
    let index = shopSelect.val();
    player.buyFromShop(index);
    refreshSelect();
    refreshShopSelect();
  })
}

function reloadShopBtn() {
  screenButtons.reloadShopBtn = $("<button class='btn btn-dark'>").appendTo("#shopSel");
  screenButtons.reloadShopBtn.html("🔄");
  screenButtons.reloadShopBtn.mouseover(showShopTime);
  screenButtons.reloadShopBtn.mouseout(showShopTitle)
  screenButtons.reloadShopBtn.click(() => {
    showShop();
    refreshShopSelect();
  });
}

function refreshShopSelect() {
  shopSelect.empty();
  if (player.shopItems) {
    for (let i = 0; i < player.shopItems.length; i++) {
      let itemName = player.shopItems[i].name;
      let part = player.shopItems[i].slot;
      let price = player.shopItems[i].price;
      shopSelect.append($("<option class='btn-dark'>").html(itemName + " (" + part + ") " + "(" + price + ")").val(i));
    }
  }
}