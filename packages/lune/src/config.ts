import type { Plugin } from "esbuild";
import type { InputOptions, OutputOptions } from "rolldown";

import { existsSync } from "fs";
import { resolve, parse } from "path";
import { pathToFileURL } from "url";

export interface LuneCfg {
  /**
   * The builder to use
   * @default esbuild
   */
  builder?: "rolldown" | "esbuild";
  /**
   * If CSS Modules should be enabled
   * @default false
   */
  cssModules?: boolean | "legacy";
  /**
   * If the output should be minified
   * @default false
   */
  minify?: boolean;
  esbuild?: {
    /** esbuild plugins that run before Lune's transforms */
    prePlugins?: Plugin[];
    /** esbuild plugins that run after Lune's transforms */
    postPlugins?: Plugin[];
  };
  rolldown?: {
    input?: InputOptions;
    output?: OutputOptions;
  };
}

export async function loadCfg(path?: string) {
  if (!path || !existsSync(resolve(path))) return null;

  const isJson = path.toLowerCase().endsWith(".json");
  const attributes = isJson ? { assert: { type: "json" } } : {};

  const module = await import(pathToFileURL(resolve(path)).href, attributes);
  return (module.default as LuneCfg) ?? null;
}

async function loadCfgByDir(path: string) {
  for (const ext of ["js", "json"]) {
    const cfgPath = resolve(path, `lune.config.${ext}`);

    if (existsSync(cfgPath)) return await loadCfg(cfgPath);
  }
  return null;
}

export async function loadNearestCfgOrDefault(path?: string) {
  let currDir = resolve(path) ?? process.cwd();
  const rootDir = parse(currDir).root;

  while (currDir !== rootDir) {
    const cfg = await loadCfgByDir(currDir);
    if (cfg) return cfg;

    // go to parent directory
    currDir = parse(currDir).dir;
  }
  return {} as LuneCfg;
}
