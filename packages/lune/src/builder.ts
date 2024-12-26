import type { LuneCfg } from "./config";

import { createHash } from "crypto";
import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import { existsSync } from "fs";
import { createRolldownBuilder } from "./builder/rolldown";
import { createEsbuildBuilder } from "./builder/esbuild";

const MD5 = (data) => createHash("md5").update(data).digest("hex").toString();

export async function buildPlugin(path: string, to: string, cfg: LuneCfg, minify = false, root = process.cwd()) {
  const outfile = resolve(to, "plugin.js");
  const outmanifest = resolve(to, "plugin.json");

  let entryPoint;
  for (const ext of ["jsx", "tsx", "js", "ts"]) {
    const testEntryPoint = resolve(path, "index." + ext);
    if (existsSync(testEntryPoint)) {
      entryPoint = testEntryPoint;
      break;
    }
  }

  if (!entryPoint) throw new Error("failed to find entrypoint - check your working directory and config");

  if (cfg.builder === "esbuild") {
    await createEsbuildBuilder(entryPoint, outfile, minify, cfg);
  } else {
    await createRolldownBuilder(entryPoint, outfile, minify, root);
  }

  const finalDistJs = (await readFile(outfile)).toString().replace(/var __lune_temp_global\s*=\s*/, "");
  await writeFile(outfile, finalDistJs);

  const manifest = JSON.parse((await readFile(resolve(path, "plugin.json"))).toString());
  await writeFile(outmanifest, JSON.stringify({ ...manifest, hash: MD5(finalDistJs) }));
}
