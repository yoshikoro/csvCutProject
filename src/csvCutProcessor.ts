function preCodeFilterCut() {
  const RNG_INFO = {
    BUCODE_RNG: 0,
    TOKUICODE_RNG: 2,
    SITECODE_RNG: 4,
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
    LEN: 57,
    B: 1,
    BO: 66,
    AS: 44,
    AT: 45,
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
    V: 21,
    W: 22,
    AU: 46,
    AV: 47,
    O: 14,
    BM: 64,
  };
  const CONFIG_INFO = {
    SHEETNAME: "config",
    TARGET_SHEETNAME_RNG: "B2",
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
  const genData = amucSh.getDataRange().getDisplayValues();
  const shopMap = new Map<
    string,
    { TEL: string; FAX: string; POSTNO: string; ADDRESS: string }
  >();
  allshopSh
    .getDataRange()
    .getValues()
    .slice(1)
    .forEach((element) => {
      shopMap.set(element[TARGET_INFO.ALL_SHOPSHEET_INFO.RNG_INFO.BUCODERNG], {
        TEL: element[TARGET_INFO.ALL_SHOPSHEET_INFO.RNG_INFO.TELRNG],
        FAX: element[TARGET_INFO.ALL_SHOPSHEET_INFO.RNG_INFO.FAXRNG],
        POSTNO: element[TARGET_INFO.ALL_SHOPSHEET_INFO.RNG_INFO.POSTRNG],
        ADDRESS: element[TARGET_INFO.ALL_SHOPSHEET_INFO.RNG_INFO.ADDRESS],
      });
    });
  const sh = sp.getSheetByName(tSheetName);
  //明細１をフィルター
  const filter = genData.filter((shopdata) => {
    const compari = shopdata[RNG_INFO.SEIKYUMEISAI_O_RNG];
    if (parseInt(compari) == 1) {
      return true;
    }
  });
  const mapData = filter.map((rows) => {
    // A列〜P列相当（QUERYでSelectしていた B, BO, AS, ... AU, AV の16項目）
    const shopCode = rows[RNG_INFO.BUCODE_RNG];
    const {
      TEL: tel = "",
      FAX: fax = "",
      POSTNO: post = "",
      ADDRESS: address = "",
    } = shopMap.get(shopCode) ?? {};

    const newRow = new Array(NEWSHEET_COL.LEN).fill(0);
    newRow[0] = rows[NEWSHEET_COL.B];
    newRow[1] = rows[NEWSHEET_COL.BO];
    newRow[2] = post;
    newRow[3] = address;
    newRow[4] = tel;
    newRow[5] = fax;
    newRow[6] = rows[NEWSHEET_COL.F];
    newRow[7] = rows[NEWSHEET_COL.BX];
    newRow[8] = rows[NEWSHEET_COL.H];
    newRow[9] = rows[NEWSHEET_COL.J];
    newRow[10] = rows[NEWSHEET_COL.K];
    newRow[11] = rows[NEWSHEET_COL.L];
    newRow[12] = rows[NEWSHEET_COL.M];
    newRow[13] = rows[NEWSHEET_COL.N];
    newRow[14] = "2"; //消費税コード
    newRow[15] = "1"; //税区分
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
    newRow[26] = "36"; //固定AG列のわからないやつ？
    newRow[27] = "賃貸";
    newRow[28] = "";
    newRow[29] = "機械賃貸料等";
    newRow[30] = "添付資料のとおり";
    newRow[31] = rows[NEWSHEET_COL.V];
    newRow[32] = rows[NEWSHEET_COL.W];
    newRow[33] = "";
    newRow[34] = "";
    newRow[35] = "";
    newRow[36] = "1";
    newRow[37] = "式";
    newRow[38] = "1"; //ここを取得形式にしたほうがいいかもAT列
    newRow[39] = "式"; //ここを取得形式にしたほうがいいかもAU列
    newRow[40] = "小計金額を計算する関数をたてる"; //O列の明細をみて１～Nまでで次の空白は入れないでAD列を足し算
    newRow[41] = "";
    newRow[42] = "";
    newRow[43] = "";
    newRow[44] = "";
    newRow[45] = "";
    newRow[46] = "";
    newRow[48] = "1"; //１指定？ 明細別の税区分の為明細をいれるようになったら１９の計算式
    newRow[49] = `${rows[NEWSHEET_COL.BM].toString()}.0`;

    //電話番号とFAX番号を解決
  });
  //

  sp.getSheetByName("AMUCQ").clearContents();
  sp.getSheetByName("AMUCQ")
    .getRange(2, 1, filter.length, filter[0].length)
    .setValues(filter);
  const data = sh.getDataRange().getDisplayValues();
}
