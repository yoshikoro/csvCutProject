const CONFIG_INFO = {
  SHEETNAME: "config",
  DISTFOLDER_ID_RNG: "A2",
  TARGET_SHEETNAME_RNG: "B2",
  HEADER_RNG: "D2:I2",
};
export function exportSheetToFile() {
  const tsheetName = "AMUCQ";
  const extension = ".txt";
  const stringFormat = "Shift_JIS";
  const sp = SpreadsheetApp.getActiveSpreadsheet();
  const configSh = sp.getSheetByName(CONFIG_INFO.SHEETNAME);
  const sh = sp.getSheetByName(tsheetName);
  if (!configSh || !sh) {
    console.error("シートが見つかりません");
    return;
  }
  const distFolderId = configSh
    .getRange(CONFIG_INFO.DISTFOLDER_ID_RNG)
    .getValue();
  const distFolder = DriveApp.getFolderById(distFolderId);
  clearnUpFolder(distFolder);

  const allData = sh.getDataRange().getDisplayValues();
  if (allData.length === 0) {
    console.log("dataがありませんでした");
    return;
  }
  const blb = cutCsv(allData, stringFormat, extension);
  DriveApp.createFile(blb).moveTo(distFolder);
  //ここから単独行を処理
  const [head, ...rows] = allData;
  rows.forEach((row) => {
    const sendData = [head, row];
    const rowBlob = cutCsv(sendData, stringFormat, extension);
    DriveApp.createFile(rowBlob).moveTo(distFolder);
  });
}
function cutCsv(
  data: any[][] | string[][],
  stringFormat: string,
  extension: string,
): GoogleAppsScript.Base.Blob {
  //ここで整形
  let csvstring = "";
  let title = `${data[1][11]}_${data[1][13]}`;
  let code = "";
  data.forEach((elements) => {
    elements.forEach((arr) => {
      arr = `"${arr}"`;
    });
    const joinstring = elements.join("\t");
    csvstring = `${csvstring}${joinstring}\r\n`; //改行
  });
  const blb = Utilities.newBlob(
    "",
    MimeType.PLAIN_TEXT,
    `${title}${extension}`,
  ).setDataFromString(csvstring, stringFormat);
  return blb;

  //ここでカット
}
export function formatCsvForSheet() {
  const RNG_INFO = {
    BUCODE_RNG: 0,
    TOKUICODE_RNG: 2,
    SITECODE_RNG: 4,
    SEIKYUNO_N_RNG: 13,
    SEIKYUKUBUN_P_RNG: 15,
    SEIKYUMEISAI_O_RNG: 14,
    TEL_AE_RNG: 30,
    FAX_AF_RNG: 31,
    BUMON_POSTNO_AS_RNG: 44,
    ADDRESS_AT_RNG: 45,
    ZEIKOTEI_AU_RNG: 46,
    ZEIKUBN_AV_RNG: 47,
  };
  // 列位置の定義 (0から始まるインデックス)
  const NEWSHEET_COL = {
    SHEETNAME: "AMUCQ",
    LEN: 51,
    B: 1,
    BO: 66,
    AS: 44,
    AT: 45,
    AD: 29,
    AE: 30,
    AF: 31,
    F: 5,
    BX: 75,
    H: 7,
    J: 9,
    K: 10,
    L: 11,
    M: 12,
    N: 13,
    U: 20,
    V: 21,
    W: 22,
    AU: 46,
    AV: 47,
    O: 14,
    BM: 64,
  };

  const TARGET_INFO = {
    AMUC_SHEET: "AMUC",
    ALL_SHOPSHEET_INFO: {
      ALL_SHOPSHEETNAME: "allshop",
      RNG_INFO: {
        BUCODERNG: 1,
        ADDRESS: 7,
        TELRNG: 9,
        FAXRNG: 10,
        POSTRNG: 6,
      },
    },
  };
  const SHEETNAMERNG = CONFIG_INFO.TARGET_SHEETNAME_RNG;
  const sp = SpreadsheetApp.getActiveSpreadsheet();
  const configSh = sp.getSheetByName(CONFIG_INFO.SHEETNAME);
  const amucSh = sp.getSheetByName(TARGET_INFO.AMUC_SHEET);
  const allshopSh = sp.getSheetByName(
    TARGET_INFO.ALL_SHOPSHEET_INFO.ALL_SHOPSHEETNAME,
  );
  if (!configSh || !amucSh || !allshopSh) {
    console.log("シートがありません");
    return;
  }
  const tSheetName = configSh.getRange(SHEETNAMERNG).getValue();
  const header = configSh.getRange(CONFIG_INFO.HEADER_RNG).getValues().flat();
  const genData = amucSh.getDataRange().getValues(); //getDisplayValues();
  /*ここから部門コードをKeyにした電話番号・住所他を取得してMapする*/
  const shopMap = new Map<
    string,
    { TEL: string; FAX: string; POSTNO: string; ADDRESS: string }
  >();
  allshopSh
    .getDataRange()
    .getValues()
    .slice(1)
    .forEach((element) => {
      shopMap.set(
        String(element[TARGET_INFO.ALL_SHOPSHEET_INFO.RNG_INFO.BUCODERNG]),
        {
          TEL: element[TARGET_INFO.ALL_SHOPSHEET_INFO.RNG_INFO.TELRNG],
          FAX: element[TARGET_INFO.ALL_SHOPSHEET_INFO.RNG_INFO.FAXRNG],
          POSTNO: element[TARGET_INFO.ALL_SHOPSHEET_INFO.RNG_INFO.POSTRNG],
          ADDRESS: element[TARGET_INFO.ALL_SHOPSHEET_INFO.RNG_INFO.ADDRESS],
        },
      );
    });
  /*ここまで*/
  /**小計金額をMapする */
  const subTotalMap = genData.slice(1).reduce((acc, currentRow) => {
    const key = String(currentRow[RNG_INFO.SEIKYUNO_N_RNG]);
    const isAdd =
      parseInt(currentRow[RNG_INFO.SEIKYUKUBUN_P_RNG]) === 98 ? false : true; //マジックNO９８だったら消費税なので小計に追加しない
    const amount = parseInt(currentRow[NEWSHEET_COL.AD]);

    if (!acc.has(key)) {
      acc.set(key, 0);
    }
    const crSum: number = acc.get(key) || 0;
    if (isAdd) {
      acc.set(key, crSum + amount);
    }

    return acc;
  }, new Map<string, number>());
  /*ここまで*/
  const sh = sp.getSheetByName(tSheetName);
  //明細１をフィルター
  const filter = genData.filter((shopdata) => {
    const compari = shopdata[RNG_INFO.SEIKYUMEISAI_O_RNG];
    if (parseInt(compari) == 1) {
      return true;
    }
  });
  //N列でフィルターして一番最終の消費税を足さない小計を求めるKeyはＮ列をキーにする
  const mapData = filter.map((rows) => {
    // A列〜P列相当（QUERYでSelectしていた B, BO, AS, ... AU, AV の16項目）
    const shopCode = String(rows[RNG_INFO.BUCODE_RNG]);
    const seikyuNo = String(rows[RNG_INFO.SEIKYUNO_N_RNG]);
    const {
      TEL: tel = "",
      FAX: fax = "",
      POSTNO: post = "",
      ADDRESS: address = "",
    } = shopMap.get(shopCode) ?? {};

    const newRow = new Array(NEWSHEET_COL.LEN).fill(0);
    newRow[0] = rows[NEWSHEET_COL.B]; //部門名
    newRow[1] = rows[NEWSHEET_COL.BO]; //社員名
    newRow[2] = post; //郵便番号
    newRow[3] = checkBytesAndCutForJis(address, 60); //住所
    newRow[4] = tel; //tel
    newRow[5] = fax; //fax
    newRow[6] = rows[NEWSHEET_COL.F]; //得意先名称
    newRow[7] = ""; //取引件名 ここに現場ごとのデータを入力する可能性あり//40byte
    newRow[8] = checkBytesAndCutForJis(rows[NEWSHEET_COL.H], 50); //現場名
    newRow[9] = rows[NEWSHEET_COL.J]; //発注者の郵便番号
    newRow[10] = checkBytesAndCutForJis(rows[NEWSHEET_COL.K], 60); //発注者の住所
    newRow[11] = rows[NEWSHEET_COL.L]; //工事コード
    newRow[12] = rows[NEWSHEET_COL.M]; //帳票の日付
    newRow[13] = rows[NEWSHEET_COL.N]; //請求書番号
    newRow[14] = "2"; //消費税コード(固定)
    newRow[15] = "1"; //税区分(固定)
    newRow[16] = "0"; //明細金額計
    newRow[17] = "0"; //消費税額
    newRow[18] = "0"; //最終帳票金額
    newRow[19] = parseInt(rows[NEWSHEET_COL.BM]) == 0 ? "5" : "1"; //税分類 非課税は5でそれ以外は1
    newRow[20] = `${rows[NEWSHEET_COL.BM].toString()}.00`;
    newRow[21] = "0"; //固定
    newRow[22] = "0"; //固定
    newRow[23] = "0001"; //多分連番？
    newRow[24] = "5"; //固定
    newRow[25] = "00"; //固定
    newRow[26] = "36"; //固定AG列のわからないやつ？ 34,35,36とあるがこれで固定でOK？
    newRow[27] = "賃貸"; //契約名称
    newRow[28] = ""; //売上契約名称
    newRow[29] = checkBytesAndCutForJis("機械賃貸料等", 54); //品名
    newRow[30] = checkBytesAndCutForJis("添付資料のとおり", 66); //性能名称
    newRow[31] = ""; //rows[NEWSHEET_COL.U]//管理番号
    newRow[32] = rows[NEWSHEET_COL.V]; //請求開始日
    newRow[33] = rows[NEWSHEET_COL.W]; //請求終了日
    newRow[34] = ""; //継続（入出庫区分名称）
    newRow[35] = ""; //使用期間
    newRow[36] = ""; //使用期間単位
    newRow[37] = "1"; //補助数量
    newRow[38] = "式"; //補助数量単位
    newRow[39] = "1"; //rows[NEWSHEET_COL.AA]//明細数量
    newRow[40] = "式"; //rows[NEWSHEET_COL.AB]//明細単位
    newRow[41] = subTotalMap.get(seikyuNo) || 0; //単価２
    newRow[42] = subTotalMap.get(seikyuNo) || 0; //明細金額(小計？)
    newRow[43] = ""; //明細別備考
    newRow[44] = ""; //明細別備考２
    newRow[45] = ""; //納品日
    newRow[46] = ""; //納品伝票番号
    newRow[47] = ""; //内部管理番号
    newRow[48] = ""; //機性型コード
    newRow[49] = ""; //姫路専用？
    newRow[50] = "1"; //１指定？ 明細別の税区分の為明細をいれるようになったら１９の計算式
    newRow[51] = `${rows[NEWSHEET_COL.BM].toString()}.0`;

    const appendData = [...header, ...newRow];
    //電話番号とFAX番号を解決
    return appendData;
  });
  //

  const newSh = sp.getSheetByName(NEWSHEET_COL.SHEETNAME);
  if (!newSh) {
    return;
  }
  const setRng = newSh.getRange(2, 1, mapData.length, mapData[0].length);

  setRng.clearContent();
  setRng.clearFormat();
  setRng.setNumberFormat("@");

  setRng.setValues(mapData);
}
function clearnUpFolder(rootFolder: GoogleAppsScript.Drive.Folder) {
  const dist = rootFolder.getFoldersByName("済み").next();
  const files = rootFolder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    file.moveTo(dist);
  }
}

/**
 * Shift_JIS換算でバイト数をチェックし、上限を超える場合は切り詰める
 * @param {string} tContents 対象文字列
 * @param {number} maxLength 許容する最大バイト数
 * @return {string} 切り詰め後の文字列
 */
function checkBytesAndCutForJis(tContents: string, maxLength: number) {
  if (!tContents) return "";

  let s = String(tContents);
  let byteLen = 0;

  for (let i = 0; i < s.length; i++) {
    let code = s.charCodeAt(i);
    let charByte = 0;

    // 半角・全角の判定
    if ((code >= 0x00 && code <= 0x7f) || (code >= 0xff61 && code <= 0xff9f)) {
      charByte = 1;
    } else {
      charByte = 2;
    }

    // 次の文字を足すと上限を超える場合、現在の位置(0からiまで)で切り出す
    if (byteLen + charByte > maxLength) {
      return s.substring(0, i);
    }

    byteLen += charByte;
  }

  // 全文字足しても上限以内ならそのまま返す
  return s;
}
function getSyokei() {}
