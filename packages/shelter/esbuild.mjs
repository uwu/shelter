import { build } from "esbuild";
import { postcssModules, sassPlugin } from "esbuild-sass-plugin-ysink";
import { solidPlugin } from "esbuild-plugin-solid";
//import {readFile, rename, writeFile} from "fs/promises";
//import merge from "merge-source-map";

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/shelter.js",
  sourcemap: "external",
  minify: !process.env.DEV,
  loader: {
    ".png": "dataurl",
    ".jpg": "dataurl",
    ".svg": "dataurl",
  },
  plugins: [
    solidPlugin(),
    sassPlugin({
      style: "compressed",
      sourceMap: false,
      transform: postcssModules({ localsConvention: "camelCaseOnly", inject: false }),
    }),
  ],
});

// TODO: find a way to merge in the shelter-ui source maps
// this does work however it means that the mappings to shelter itself break
// mappings intact to shelter + intact to the unminified shelter-ui dist is preferable, as shelter itself is minified.
/*
const srcMapUi = JSON.parse((await readFile("../shelter-ui/dist/index.jsx.map")).toString());
const srcMapSh = JSON.parse((await readFile("./dist/shelter.js.map")).toString());

// fix paths else shelter-ui sources show up in shelter/src
srcMapUi.sources = srcMapUi.sources.map(s => "../../shelter-ui/" + s.slice(3));

const merged = merge(srcMapUi, srcMapSh);

await rename("./dist/shelter.js.map", "./dist/shelter.js-original.map");
await writeFile("./dist/shelter.js.map", JSON.stringify(merged));*/
