import type { LuneCfg } from "../../config";
import { ShelterSolidResolver } from "./resolver";
import { CSSPlugin } from "./css";
import { SolidPlugin } from "./solid-swc";

export async function createRolldownBuilder(entrypoint: string, outfile: string, minify: boolean, cfg: LuneCfg) {
  if (cfg.builder !== "rolldown")
    throw new Error("Cannot create rolldown builder with config specifying another builder");

  const { build } = await import("rolldown");

  return await build({
    ...cfg.input,
    plugins: [await SolidPlugin(), ShelterSolidResolver(), CSSPlugin(cfg)],
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
