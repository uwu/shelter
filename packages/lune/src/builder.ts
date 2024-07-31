import type { LuneCfg } from "./config.js";
import { createHash } from "crypto";
import { readFile, writeFile, mkdir } from "fs/promises";
import { resolve } from "path";
import { existsSync } from "fs";
import { build } from "esbuild";
import { solidPlugin as solidEsbuildPlugin } from "esbuild-plugin-solid";
import solidVitePlugin from "vite-plugin-solid";
import { sassPlugin, postcssModules } from "esbuild-sass-plugin-ysink";
import { buildToString as farmBuild } from "./farmbuilder.js";

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

export async function buildPlugin(path: string, to: string, cfg: LuneCfg, minify = false) {
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

  const sharedEsbuildOptions = {
    globalName: "__lune_temp_global",
    logLevel: "silent", // we handle errors ourself
  } as const;

  if (cfg.useFarm == true) {
    const built = await farmBuild({
      vitePlugins: [
        () => ({
          vitePlugin: solidVitePlugin(),
          filters: ["\\.tsx$", "\\.jsx$"],
        }),
        ...(cfg.vitePlugins ?? []),
      ],
      plugins: [...(cfg.farmPlugins ?? [])],
      compilation: {
        partialBundling: {
          enforceResources: [
            {
              name: "index",
              test: [".+"],
            },
          ],
        },
        minify: false, // set to false because esbuild handles this for us.
        persistentCache: false,
        output: { targetEnv: "library-browser", format: "esm" },
        input: { index: entryPoint },
        external: [
          { "solid-js/web": "shelter.solidWeb", "solid-js/store": "shelter.solidStore", "solid-js": "shelter.solid" },
        ],
      },
    });

    try {
      await mkdir(to, { recursive: true });
    } catch {}

    await writeFile(
      outfile,
      (
        await build({
          stdin: {
            contents: built,
            sourcefile: "index.js",
          },
          minify,
          bundle: true,
          write: false,
          // I didn't want to have to do this, really. But no matter what I've tried, I can't get Farm to work how I want it to, unfortunately.
          // I've noticed that the solid-js Vite plugin adds an import to solid-js/web, which is fine, but it does not get caught by Farm at any point, so I can't mark it as external.
          plugins: [shelterEsbuildResolver()],
          ...sharedEsbuildOptions,
        })
      ).outputFiles[0].text,
    );
  } else {
    await build({
      entryPoints: [entryPoint],
      outfile,
      bundle: true,
      minify,
      plugins: [
        ...(cfg.prePlugins ?? []),
        solidEsbuildPlugin(),
        (cfg.cssModules
          ? sassPlugin({
              style: "compressed",
              sourceMap: false,
              transform: postcssModules({
                localsConvention: "camelCaseOnly",
                inject: cfg.cssModules === "legacy" ? false : "shelter",
              } as any),
            })
          : sassPlugin({ style: "compressed", sourceMap: false, type: "css-text" })) as any, // bad but version conflicts suck
        shelterEsbuildResolver(),
        ...(cfg.postPlugins ?? []),
      ],
      ...sharedEsbuildOptions,
    });
  }

  const finalDistJs = (await readFile(outfile)).toString().replace(/var __lune_temp_global\s*=\s*/, "");
  await writeFile(outfile, finalDistJs);
  const manifest = JSON.parse((await readFile(resolve(path, "plugin.json"))).toString());
  await writeFile(outmanifest, JSON.stringify({ ...manifest, hash: MD5(finalDistJs) }));
}
