// @ts-check

import { readFile, writeFile } from "fs/promises";
import { build } from "esbuild";
import module from "module";
import pkg from "./package.json" with { type: "json" };

const deps = Object.keys(pkg.dependencies).filter((d) => !d.includes("solid"));

await build({
  entryPoints: ["dist/src/index.js"],
  bundle: true,
  outfile: "dist/clibundle.cjs",
  external: [...deps, ...module.builtinModules],
  platform: "node",
});

for (const f of ["dist/src/index.js", "dist/clibundle.cjs"])
  await writeFile(f, "#!/usr/bin/env node\n" + (await readFile(f)).toString());
