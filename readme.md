# Google Apps Script with esbuild Template

TypeScript と esbuild を使用して、モダンな開発環境で Google Apps Script (GAS) プロジェクトを構築するためのテンプレートです。
バックエンドの開発に特化させています

## ✨ 特徴

- **TypeScript 対応**: 型の恩恵を受けながら安全に開発できます。
- **モジュール利用**: `import`/`export`構文でコードをファイル分割し、管理しやすくします。
- **高速ビルド**: esbuild により、コードのバンドル（ひとまとめにする作業）が非常に高速です。
- **デプロイ自動化**: `npm`スクリプトでビルドからデプロイまでを一行のコマンドで実行できます。
- **clasp 連携**: Google の公式 CLI ツール`clasp`と連携して GAS プロジェクトを管理します。

## 🚀 始め方

### 1. 前提条件

開発を始める前に、以下のツールがインストールされていることを確認してください。

- [Node.js](https://nodejs.org/) (v18 以上を推奨)
- [npm](https://www.npmjs.com/) (Node.js に付属)
- [clasp](https://github.com/google/clasp): Google Apps Script のコマンドラインツール
  ```bash
  npm install -g @google/clasp
  ```

### 2. セットアップ

1.  **リポジトリの作成**
    このリポジトリの「Use this template」ボタンをクリックして、新しいリポジトリを作成します。

2.  **クローンと依存関係のインストール**
    作成したリポジトリをローカルにクローンし、依存パッケージをインストールします。

    ```bash
    git clone git@github.com:{あなたのユーザー名}/{あなたのリポジトリ名}.git
    cd {あなたのリポジトリ名}
    npm install
    ```

3.  **Google アカウントへのログイン**
    `clasp`が Google アカウントにアクセスできるように認証します。

    ```bash
    clasp login
    ```

4.  **GAS プロジェクトとの連携**
    - **新規プロジェクトの場合:**
      `dist`ディレクトリをルートとして新しい GAS プロジェクトを作成します。
      ```bash
      # standaloneのスクリプトを作成する場合
      clasp create --type standalone --title "My New Project" --rootDir ./dist
      ```
    - **既存プロジェクトの場合:**
      既存の GAS プロジェクトのスクリプト ID をクローンします。
      ```bash
      clasp clone <scriptId> --rootDir ./dist
      ```

## 📂 ディレクトリ構成

```
./
├── dist
├── esbuild.js
├── package-lock.json
├── package.json
├── readme.md
├── src
│   ├── appsscript.json
│   ├── event.ts
│   ├── main.ts
│   └── static
│       └── index.html
├── tsconfig.json
├── tscsrc
│   ├── event.ts
│   └── static
│       └── index.html
└── worksheetfunctions
    ├── appsscript.json
    └── worksheetfunction.ts


```

## 💻 開発フロー

1.  `src/` ディレクトリ内で TypeScript (`.ts`) ファイルを作成・編集します。
2.  GAS のトリガー (`onOpen`など) や、クライアントサイドから `google.script.run` で呼び出す関数は、エントリーポイントとなるファイル (例: `src/main.ts`) で `global` オブジェクトに登録します。

    ```typescript
    // src/main.ts
    import { someFunction } from "./lib";

    // このように登録することで、GASからグローバル関数として呼び出せるようになります
    global.myFunction = someFunction;
    ```

3.  `appsscript.json`や HTML ファイルなどの静的アセットも`src/`ディレクトリに配置します。
4.  開発が完了したら、以下のコマンドでデプロイします。
    ```bash
    npm run deploy
    ```
    このコマンドは、アセットのコピー、TypeScript のビルド、GAS プロジェクトへのプッシュを自動的に行います。

## 📜 NPM スクリプト一覧

- `npm run build`: `src`の TS ファイルをビルドし、`dist`に出力します。
- `npm run copy-assets`: `src`のアセットファイル(`appsscript.json`, `.html`など)を`dist`にコピーします。
- `npm run push`: `dist`ディレクトリの内容を GAS にデプロイします。
- **`npm run deploy`**: `copy-assets`, `build`, `push`を順番に実行します。**開発中は主にこのコマンドを使用します。**
- `npm run open`: GAS プロジェクトをブラウザで開きます。
- `npm run clean`: `dist`ディレクトリの中身を削除します。

## ⚠️ 注意点

### GAS で関数を公開する方法

esbuild でバンドルされたコード内の関数を GAS が認識できるようにするには、その関数をグローバルスコープに公開する必要があります。これは `global` オブジェクトに関数を代入することで実現します。

**例:**

```typescript
// src/lib.ts
export function sayHello() {
  Logger.log("こんにちは！");
}

// src/main.ts
import { sayHello } from "./lib";

// GASから `sayHello` という名前で呼び出せるようにする
global.sayHello = sayHello;
```

`esbuild-gas-plugin`には`exports`を自動で`global`に変換する機能もありますが、上記のように明示的に`global`へ登録する方法が最も確実で意図しない挙動を防げます。

## 📝 TypeScript（TSC）によるビルド運用

このテンプレートは`esbuild`によるバンドルを前提としていますが、**esbuild を使いたくない場合**や、  
「TypeScript 標準のトランスパイル（`tsc`）だけで十分」という場合も対応できます。

- `tscsrc/` ディレクトリ内に TypeScript ファイルを配置してください。
- `tsc`コマンドでトランスパイルすると、各ファイルがそのまま JavaScript に変換されます。
- GAS の仕様上、トップレベルに関数を列挙すればグローバル関数として認識されます。

**例:**

```
.
├── tscsrc/
│   ├── static
│   │   ├──...htmlFiles
│   ├── main.ts
│   ├── util.ts
│   └── appsscript.json
```

**ビルド方法:**

- `npm run ` nbuild: `tscsrc`の TS ファイルをビルドし、`dist`に出力します。

> `tsconfig.json`は`tscsrc/`用の設定ファイルを用意してください。

**ポイント:**

- esbuild のようなバンドルは行われません。各`.ts`ファイルが個別に`.js`になります。
- GAS では、`main.js`などにグローバル関数をそのまま書けば認識されます。
- `clasp`の`--rootDir`を`tscsrc`や`tscsrc/dist`に設定して運用できます。

---

**このように、用途や好みに応じて`esbuild`/`tsc`どちらでも開発できます。**

## License

ISC
