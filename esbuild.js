import esbuild from "esbuild";
import { GasPlugin } from "esbuild-gas-plugin";
esbuild
  .build({
    entryPoints: ["./src/main.ts"],
    bundle: true,
    minify: false,
    outfile: "./dist/main.js",
    target: "ES2021",
    plugins: [GasPlugin],
    legalComments: "inline", // コメントを残す
    charset: "utf8", //アスキーコードではなく
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
