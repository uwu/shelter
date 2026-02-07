import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vitepress";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "../../..");
const demosEntry = resolve(rootDir, "demos/src/index.tsx");

const virtualId = "virtual:shelter-demos";
const resolvedVirtualId = "\0virtual:shelter-demos";

/**
 * Resolves "virtual:shelter-demos" to the real demos entry file,
 * letting Vite's native pipeline (solid, sass, etc.) handle all transforms.
 */
export default function shelterDemosPlugin(): Plugin {
  return {
    name: "shelter-demos-virtual-module",
    enforce: "pre",

    resolveId(id) {
      if (id === virtualId) return resolvedVirtualId;
      return undefined;
    },

    load(id) {
      if (id !== resolvedVirtualId) return undefined;
      return `export * from ${JSON.stringify(demosEntry)};`;
    },
  };
}
