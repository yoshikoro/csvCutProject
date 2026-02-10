const CONFIGDATA = {
  CONFIGMESSAGE: "こんにちは",
};
/*
 * @description メニュー用
 * @author yoshitaka <sato-yoshitaka@aktio.co.jp>
 * @date 29/03/2024
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu("実行メニュー");
  menu.addItem("認証", "excuteMain");
  menu.addItem("実行", "excuteMain");
  menu.addToUi();
}

function getHello(message: string = "hello") {
  Logger.log(message);
}
