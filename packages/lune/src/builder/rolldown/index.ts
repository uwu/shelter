import type { LuneCfg } from "../../config";
import { ShelterSolidResolver } from "./resolver";
import { CSSPlugin } from "./css";
import { SolidPlugin } from "./solid";

export async function createRolldownBuilder(entrypoint: string, outfile: string, minify: boolean, cfg: LuneCfg) {
  if (cfg.builder && cfg.builder !== "rolldown")
    throw new Error("Cannot create rolldown builder with config specifying another builder");

  const { build } = await import("rolldown");

  if ("prePlugins" in cfg || "postPlugins" in cfg) {
    console.warn(`prePlugins and postPlugins are esbuild options, and will be ignored when building with Rolldown.
Hint: the default bundler changed in Lune 1.5.1, if you have updated Lune and relied on esbuild options, set "builder": "esbuild" in your config.`);
  }

  return await build({
    ...cfg.input,
    plugins: [SolidPlugin(), ShelterSolidResolver(), CSSPlugin(cfg)],
    input: entrypoint,
    output: {
      ...cfg.output,
      minify,
      file: outfile,
      format: "iife",
    },
    logLevel: "silent",
  });
}
