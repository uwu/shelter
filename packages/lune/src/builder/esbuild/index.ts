import type { LuneCfg } from "../../config";
import { ShelterSolidResolver } from "./resolver";
import { CSSPlugin } from "./css";

export async function createEsbuildBuilder(entryPoint: string, outfile: string, minify: boolean, cfg: LuneCfg) {
  if (cfg.builder && cfg.builder !== "esbuild")
    throw new Error("Cannot create esbuild builder with config specifying another builder");

  const { build } = await import("esbuild");
  const { solidPlugin } = await import("esbuild-plugin-solid");

  return await build({
    entryPoints: [entryPoint],
    outfile,
    bundle: true,
    minify,
    plugins: [
      ...(cfg.prePlugins ?? []),

      solidPlugin(),
      CSSPlugin(cfg),
      ShelterSolidResolver(),

      ...(cfg.postPlugins ?? []),
    ],
    globalName: "__lune_temp_global",
    logLevel: "silent", // we handle errors ourself
  });
}
