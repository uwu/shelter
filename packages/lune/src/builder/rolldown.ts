import { SolidPlugin } from "./rolldown/solid";
import { ShelterSolidResolver } from "./rolldown/resolver";
import { LightningCSSPlugin } from "./rolldown/lightningcss";

export async function createRolldownBuilder(entryPoint: string, outfile: string, minify: boolean, root: string) {
  const { build } = await import("rolldown").catch(() => {
    throw new Error("Failed to load Rolldown. Please install it with `npm install rolldown`.");
  });

  // @ts-expect-error
  const code = await build({
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

  return code;
}
