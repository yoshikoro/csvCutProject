/**
 * HTMLコンテンツを文字列として定義
 * ※バッククォート（`）で囲むことで、HTMLをそのまま記述できます。
 */
const HTML_CONTENT = `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body { font-family: sans-serif; padding: 10px; }
    .action { margin-top: 10px; padding: 5px 10px; cursor: pointer; }
    .select { margin-right: 5px; }
  </style>
</head>
<body>
  <h3>ファイル選択取り込み</h3>
  <div id="uploadresult"></div>
  <form id="upForm">
    <input name="myFile" type="file" />
    <br><br>
    <input type="radio" name="charset" class="select" id="utf8" value="UTF-8">
    <label for="utf8">UTF-8</label>
    <input type="radio" name="charset" class="select" id="shiftjis" value="MS932" checked>
    <label for="shiftjis">Shift-Jis</label>
    <br><br>
    <input type="button" class="action" value="データ追加" id="addData" />
    <input type="button" class="action" value="ARMSデータ追加" id="addArmsData" />
  </form>

  <script>
    window.addEventListener("load", () => {
      // 1. データ追加ボタン
      document.getElementById("addData").addEventListener("click", (e) => {
        handleUpload(e.currentTarget, "dataAdd");
      });

      // 2. ARMSデータ追加ボタン
      document.getElementById("addArmsData").addEventListener("click", (e) => {
        handleUpload(e.currentTarget, "dataAddForArms");
      });
    });

    function handleUpload(button, methodName) {
      button.style.display = "none";
      document.getElementById("uploadresult").innerHTML = "読み込み中...";

      // 動的にGASのメソッド名を指定して実行
      google.script.run
        .withSuccessHandler(() => {
          success();
          button.style.display = "block";
        })
        .withFailureHandler((err) => {
          onFailure(err);
          button.style.display = "block";
        })[methodName](button.parentNode);
    }

    function success() {
      document.getElementById("uploadresult").innerHTML = "データを追加しました";
    }

    function onFailure(err) {
      document.getElementById("uploadresult").innerHTML = "取り込み失敗: " + err.message;
    }
  </script>
</body>
</html>
`;

/**
 * メニューからHTMLダイアログを表示
 */
export function showCsvUploader() {
  const htmlOutput = HtmlService.createHtmlOutput(HTML_CONTENT)
    .setWidth(400)
    .setHeight(300)
    .setTitle("CSVアップローダー");
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, "ファイル取り込み");
}

/**
 * GAS側のデータ処理メイン関数
 */
export function dataAdd(htmlForm: any) {
  const dataSheetName = "AMUC";
  const file = htmlForm.myFile as GoogleAppsScript.Base.Blob;
  const charset = htmlForm.charset as string;

  const rawData = csvChange(file, charset);
  const data = rawData;

  const sp = SpreadsheetApp.getActiveSpreadsheet();
  const sh = sp.getSheetByName(dataSheetName);

  if (!sh) {
    throw new Error("必要なシート（config または data）が見つかりません");
  }

  const spId = sp.getId();
  const shName1 = sh.getName();

  // Sheets API 用のオプション設定
  const resource = {
    valueInputOption: "USER_ENTERED",
    data: [{ range: shName1, values: data }],
  };

  // データのクリアと更新
  Sheets!.Spreadsheets!.Values!.clear({}, spId, shName1);
  Sheets!.Spreadsheets!.Values!.batchUpdate(resource, spId);
}

/**
 * CSVを二次元配列に変換
 */
function csvChange(
  file: GoogleAppsScript.Base.Blob,
  charset: string,
): string[][] {
  const blob = file.getDataAsString(charset);
  return Utilities.parseCsv(blob);
}
