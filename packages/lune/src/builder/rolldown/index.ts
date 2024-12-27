import type { LuneCfg } from "../../config";
import { ShelterSolidResolver } from "./resolver";

export async function createRolldownBuilder(entrypoint: string, outfile: string, minify: boolean, cfg: LuneCfg) {
  if (cfg.builder !== "rolldown")
    throw new Error("Cannot create rolldown builder with config specifying another builder");

  const { build } = await import("rolldown");
  const { LightningCSSPlugin } = await import("./lightningcss");
  const { SolidPlugin } = await import("./solid");

  return await build({
    ...cfg.input,
    plugins: [SolidPlugin(), ShelterSolidResolver(), await LightningCSSPlugin(cfg)],
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
