import { LuneCfg } from "../../config";
import { SolidPlugin } from "./solid";
import { ShelterSolidResolver } from "./resolver";
import { LightningCSSPlugin } from "./lightningcss";
import { build } from "rolldown";

export async function createRolldownBuilder(entryPoint: string, outfile: string, minify: boolean, cfg: LuneCfg) {
  if (cfg.builder !== "rolldown")
    throw new Error("Cannot create rolldown builder with config specifying another builder");

  return build({
    ...cfg.input,
    plugins: [SolidPlugin(), ShelterSolidResolver(), LightningCSSPlugin(cfg)],
    input: entryPoint,
    output: {
      ...cfg.output,
      minify,
      file: outfile,
      format: "iife",
      globals: {
        "solid-js/web": "shelter.solidWeb",
        "solid-js/store": "shelter.solidStore",
        "solid-js": "shelter.solid",
      },
    },
    external: ["solid-js/web", "solid-js/store", "solid-js"],
    logLevel: "silent",
  });
}
