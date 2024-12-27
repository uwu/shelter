import type { LuneCfg } from "../../config";

export async function createEsbuildBuilder(entryPoint: string, outfile: string, minify: boolean, cfg: LuneCfg) {
  if (cfg.builder && cfg.builder !== "esbuild")
    throw new Error("Cannot create esbuild builder with config specifying another builder");

  const { build } = await import("esbuild");
  const { solidPlugin } = await import("esbuild-plugin-solid");
  const { StylesPlugin, postcssModules } = await import("./styles");
  const { ShelterSolidResolver } = await import("./resolver");

  return await build({
    entryPoints: [entryPoint],
    outfile,
    bundle: true,
    minify,
    plugins: [
      ...(cfg.prePlugins ?? []),

      solidPlugin(),
      (cfg.cssModules
        ? StylesPlugin({
            style: "compressed",
            sourceMap: false,
            transform: postcssModules({
              localsConvention: "camelCaseOnly",
              inject: cfg.cssModules === "legacy" ? false : "shelter",
            } as any),
          })
        : StylesPlugin({
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
