// @ts-check

import { readFile, writeFile } from "fs/promises";
import { build } from "esbuild";

await build({
  entryPoints: ["dist/src/index.js"],
  bundle: true,
  outfile: "dist/clibundle.cjs",
  //outfile: "dist/clibundle.mjs",
  format: "esm",
  external: [
    // literally everything except from esbuild-plugin-solid
    "chokidar",
    "esbuild",
    "esbuild-sass-plugin-ysink",
    "postcss",
    "postcss-modules",
    "solid-js",
    "ws",
    // build tool things that need to be excluded, may necessitate extra dependencies that should just be sub-deps
    "@farmfe/core",
    "vitefu",
    "lightningcss",
    //"sass",
    "vite",
    "vite-plugin-solid",
    // node things esbuild doesn't know about
    "readline/promises",
  ],
  platform: "node",
});

for (const builtIndex of ["dist/src/index.js", "dist/clibundle.cjs"])
  await writeFile(
    builtIndex,
    "#!/usr/bin/env node --no-warnings=ExperimentalWarning\n" + (await readFile(builtIndex)).toString(),
  );
