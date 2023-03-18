import { createHash } from "crypto";
import { readdir, readFile, writeFile, rm } from "fs/promises";
import { resolve } from "path";
import { existsSync } from "fs";
import { build, Plugin } from "esbuild";
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

export interface LuneCfg {
  /**
   * The subdir containing plugins in a monorepo
   * @default "plugins"
   */
  repoSubDir?: string;
  /**
   * If CSS Modules should be enabled (for sass/scss files only currently)
   * @default false
   */
  cssModules?: boolean;

  /** esbuild plugins that run before Lune's transforms */
  prePlugins?: Plugin[];
  /** esbuild plugins that run after Lune's transforms */
  postPlugins?: Plugin[];
}

const MD5 = (data) => createHash("md5").update(data).digest("hex").toString();

export const loadCfg = async (path = "lune.config.js") =>
  existsSync(resolve(".", path)) ? ((await import(resolve(".", path))) as LuneCfg) : {};

export async function buildPlugin(path: string, to: string, cfg: LuneCfg, dev = false) {
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

  await build({
    entryPoints: [entryPoint],
    outfile,
    bundle: true,
    minify: !dev,
    plugins: [
      ...cfg.prePlugins,
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
      ...cfg.postPlugins,
    ],
    globalName: "__lune_temp_global",
  });

  const finalDistJs = (await readFile(outfile)).toString().replace(/var __lune_temp_global\s*=\s*/, "");
  await writeFile(outfile, finalDistJs);

  const manifest = JSON.parse((await readFile(resolve(path, "plugin.json"))).toString());
  await writeFile(outmanifest, JSON.stringify({ ...manifest, hash: MD5(finalDistJs) }));
}
