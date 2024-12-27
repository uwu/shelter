import type { OnLoadResult, Plugin } from "esbuild";
import { dirname } from "path";
import type { SassPluginOptions } from "./index";
import { getContext, makeModule, modulesPaths, parseNonce } from "./utils";
import { useCache } from "./cache";
import { createRenderer } from "./render";

const DEFAULT_FILTER = /\.(s[ac]ss|css)$/;

/**
 *
 * @param options
 */
export function StylesPlugin(options: SassPluginOptions = {}): Plugin {
  if (!options.basedir) {
    options.basedir = process.cwd();
  }

  if (options.includePaths) {
    console.log(`'includePaths' option is deprecated, please use 'loadPaths' instead`);
  }
  options.loadPaths = Array.from(new Set([...(options.loadPaths || modulesPaths()), ...(options.includePaths || [])]));

  const type = options.type ?? "css";

  if (options["picomatch"] || options["exclude"] || typeof type !== "string") {
    console.log(
      "The type array, exclude and picomatch options are no longer supported, please refer to the README for alternatives.",
    );
  }

  const nonce = parseNonce(options.nonce);

  return {
    name: "lune:esbuild:styles",
    setup({ initialOptions, onResolve, onLoad, resolve }) {
      const { sourcemap, watched } = getContext(initialOptions);

      const renderSync = createRenderer(options, options.sourceMap ?? sourcemap);
      const transform = options.transform ? options.transform.bind(options) : null;

      if (options.cssImports) {
        onResolve({ filter: /^~.*\.css$/ }, ({ path, importer, resolveDir }) => {
          return resolve(path.slice(1), { importer, resolveDir });
        });
      }

      onLoad(
        { filter: options.filter ?? DEFAULT_FILTER },
        useCache(options, async (path) => {
          try {
            let { cssText, watchFiles } = renderSync(path);

            if (watched) {
              watched[path] = watchFiles;
            }

            const resolveDir = dirname(path);

            if (transform) {
              const out: string | OnLoadResult = await transform(cssText, resolveDir, path);
              if (typeof out !== "string") {
                return {
                  contents: out.contents,
                  loader: out.loader,
                  resolveDir,
                  watchFiles: [...watchFiles, ...(out.watchFiles || [])],
                  watchDirs: out.watchDirs || [],
                };
              } else {
                cssText = out;
              }
            }

            return type === "css"
              ? {
                  contents: cssText,
                  loader: "css",
                  resolveDir,
                  watchFiles,
                }
              : {
                  contents: makeModule(cssText, type, nonce),
                  loader: "js",
                  resolveDir,
                  watchFiles,
                };
          } catch (err: any) {
            return {
              errors: [{ text: err.message }],
              watchFiles: watched?.[path] ?? [path],
            };
          }
        }),
      );
    },
  };
}
