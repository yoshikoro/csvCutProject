/*
 * @description メニュー用
 * @author yoshitaka <sato-yoshitaka@aktio.co.jp>
 * @date 29/03/2024
 */
export function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu("実行メニュー");
  menu.addItem("ファイル取込", "showCsvUploader");
  menu.addItem("シート整形", "formatCsvForSheet");
  menu.addItem("ファイル出力", "exportSheetToFile");
  menu.addToUi();
}
