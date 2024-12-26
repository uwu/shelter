import type { Plugin } from "esbuild";
import { build } from "esbuild";
import { solidPlugin } from "esbuild-plugin-solid";
import { sassPlugin, postcssModules } from "esbuild-sass-plugin-ysink";
import { LuneCfg } from "../config";

const ShelterSolidResolver = (): Plugin => {
  const resolverRoots = {
    "solid-js": "solid",
  };
  return {
    name: "shelter-solid-resolver",
    setup(build) {
      build.onResolve({ filter: /solid-js(?:\/web|\/store)?/ }, ({ path }) => ({
        path,
        namespace: "shltr-res-ns",
      }));
      build.onLoad({ filter: /.*/, namespace: "shltr-res-ns" }, ({ path }) => {
        const pathSplit = path.split("/");
        const resolvedPath =
          resolverRoots[pathSplit[0]] +
          pathSplit
            .slice(1)
            .map((s) => s[0].toUpperCase() + s.slice(1))
            .join("");

        return {
          contents: `module.exports = shelter.${resolvedPath}`,
          loader: "js",
        };
      });
    },
  };
};

export async function createEsbuildBuilder(entryPoint: string, outfile: string, minify: boolean, cfg: LuneCfg) {
  if (cfg.builder !== "esbuild")
    throw new Error("Cannot create esbuild builder with config specifying another builder");

  await build({
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
