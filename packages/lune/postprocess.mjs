// @ts-check

import { readFile, writeFile } from "fs/promises";
import { build } from "esbuild";

await build({
  entryPoints: ["dist/index.js"],
  format: "esm",
  bundle: true,
  outfile: "dist/clibundle.mjs",
  external: [
    // literally everything except from esbuild-plugin-solid
    "chokidar",
    "esbuild",
    "esbuild-sass-plugin-ysink",
    "postcss",
    "postcss-modules",
    "solid-js",
    "ws",
    // node things esbuild doesn't know about
    "readline/promises",
  ],
  platform: "node",
});

for (const f of ["dist/index.js", "dist/clibundle.mjs"])
  await writeFile(f, "#!/usr/bin/env node\n" + (await readFile(f)).toString());
