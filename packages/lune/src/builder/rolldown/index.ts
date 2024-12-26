import { SolidPlugin } from "./solid";
import { ShelterSolidResolver } from "./resolver";
import { LightningCSSPlugin } from "./lightningcss";
import { build } from "rolldown";

export async function createRolldownBuilder(entryPoint: string, outfile: string, minify: boolean, root: string) {
  // @ts-expect-error
  return build({
    plugins: [SolidPlugin(), ShelterSolidResolver(), LightningCSSPlugin(minify, root)],
    input: {
      input: entryPoint,
    },
    output: {
      minify,
      file: outfile,
      format: "iife",
    },
    external: [
      {
        "solid-js/web": "shelter.solidWeb",
        "solid-js/store": "shelter.solidStore",
        "solid-js": "shelter.solid",
      },
    ],
    logLevel: "silent",
  });
}
