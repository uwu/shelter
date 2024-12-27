import type { CachedResult, SassPluginOptions } from "./index";
import type { OnLoadArgs, OnLoadResult } from "esbuild";
import { promises as fsp, Stats } from "fs";

type OnLoadCallback = (args: OnLoadArgs) => OnLoadResult | Promise<OnLoadResult>;
type PluginLoadCallback = (path: string) => OnLoadResult | Promise<OnLoadResult>;

function collectStats(watchFiles): Promise<Stats[]> {
  return Promise.all(watchFiles.map((filename) => fsp.stat(filename)));
}

function maxMtimeMs(stats: Stats[]) {
  return stats.reduce((max, { mtimeMs }) => Math.max(max, mtimeMs), 0);
}

function getCache(options: SassPluginOptions): Map<string, CachedResult> | undefined {
  if (options.cache ?? true) {
    if (typeof options.cache === "object") {
      return options.cache;
    } else {
      return new Map();
    }
  }
}

export function useCache(options: SassPluginOptions = {}, loadCallback: PluginLoadCallback): OnLoadCallback {
  const cache = getCache(options);
  if (cache) {
    return async ({ path }: OnLoadArgs) => {
      try {
        let cached = cache.get(path);
        if (cached) {
          let watchFiles = cached.result.watchFiles!;
          let stats = await collectStats(watchFiles);
          for (const { mtimeMs } of stats) {
            if (mtimeMs > cached.mtimeMs) {
              cached.result = await loadCallback(watchFiles[0]);
              cached.mtimeMs = maxMtimeMs(stats);
              break;
            }
          }
          return cached.result;
        }
        let result = await loadCallback(path);
        cache.set(path, {
          mtimeMs: maxMtimeMs(await collectStats(result.watchFiles)),
          result,
        });
        return result;
      } catch (error) {
        cache.delete(path);
        throw error;
      }
    };
  } else {
    return ({ path }) => loadCallback(path);
  }
}
