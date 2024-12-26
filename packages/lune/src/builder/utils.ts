export function createCachedImport<T>(imp: () => Promise<T>): () => T | Promise<T> {
  let cached: T | Promise<T>;
  return () => {
    if (!cached) {
      cached = imp().then((module) => {
        cached = module;
        return module;
      });
    }
    return cached;
  };
}

export const importLightningCSS = createCachedImport(() => import("lightningcss"));
export const importSass = createCachedImport(() => import("sass"));
export const importEsbuild = createCachedImport(() => import("esbuild"));
