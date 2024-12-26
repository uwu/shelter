import { solidPlugin } from "esbuild-plugin-solid";
import { sassPlugin, postcssModules } from "esbuild-sass-plugin-ysink";
import type { LuneCfg } from "../../config";
import { ShelterSolidResolver } from "./resolver";
import { importEsbuild } from "../utils";

export async function createEsbuildBuilder(entryPoint: string, outfile: string, minify: boolean, cfg: LuneCfg) {
  if (cfg.builder && cfg.builder !== "esbuild")
    throw new Error("Cannot create esbuild builder with config specifying another builder");

  return await (await importEsbuild()).build({
    entryPoints: [entryPoint],
    outfile,
    bundle: true,
    minify,
    plugins: [
      ...(cfg.prePlugins ?? []),

      solidPlugin(),
      (cfg.cssModules
        ? sassPlugin({
            style: "compressed",
            sourceMap: false,
            transform: postcssModules({
              localsConvention: "camelCaseOnly",
              inject: cfg.cssModules === "legacy" ? false : "shelter",
            } as any),
          })
        : sassPlugin({
            style: "compressed",
            sourceMap: false,
            type: "css-text",
          })) as any, // bad but version conflicts suck
      ShelterSolidResolver(),

      ...(cfg.postPlugins ?? []),
    ],
    globalName: "__lune_temp_global",
    logLevel: "silent", // we handle errors ourself
  });
}
