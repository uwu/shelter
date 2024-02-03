import type { LuneCfg } from "./config";

import { createHash } from "crypto";
import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import { existsSync } from "fs";
import { build } from "esbuild";
import { solidPlugin } from "esbuild-plugin-solid";
import { sassPlugin, postcssModules } from "esbuild-sass-plugin-ysink";

const resolverRoots = {
  "solid-js": "solid",
};

const shelterEsbuildResolver = () => ({
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
});

const MD5 = (data) => createHash("md5").update(data).digest("hex").toString();

export async function buildPlugin(path: string, to: string, cfg: LuneCfg, minify = true) {
  const outfile = resolve(to, "plugin.js");
  const outmanifest = resolve(to, "plugin.json");

  let entryPoint;
  for (const ext of ["jsx", "tsx", "js", "ts"]) {
    const testEntryPoint = resolve(path, "index." + ext);
    if (existsSync(testEntryPoint)) {
      entryPoint = testEntryPoint;
      break;
    }
  }

  if (!entryPoint) throw new Error("failed to find entrypoint - check your working directory and config");

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
              inject: false,
            } as any),
          })
        : sassPlugin({ style: "compressed", sourceMap: false, type: "css-text" })) as any, // bad but version conflicts suck
      shelterEsbuildResolver(),
      ...(cfg.postPlugins ?? []),
    ],
    globalName: "__lune_temp_global",
    logLevel: "silent", // we handle errors ourself
  });

  const finalDistJs = (await readFile(outfile)).toString().replace(/var __lune_temp_global\s*=\s*/, "");
  await writeFile(outfile, finalDistJs);

  const manifest = JSON.parse((await readFile(resolve(path, "plugin.json"))).toString());
  await writeFile(outmanifest, JSON.stringify({ ...manifest, hash: MD5(finalDistJs) }));
}
