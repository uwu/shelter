import type { Plugin } from "rolldown";
import { resolve } from "path";

function getExtension(filename: string): string {
  const index = filename.lastIndexOf(".");
  return index < 0 ? "" : filename.substring(index).replace(/\?.+$/, "");
}

export const SolidPlugin = async (): Promise<Plugin> => {
  const { transformFile } = await import("@swc/core");

  return {
    name: "lune:rolldown:solid-js-swc",
    transform: {
      // Handle only .tsx and .jsx files
      filter: { id: /(\.tsx|\.jsx)$/ },
      handler: async (source, id) => {
        const currentFileExtension = getExtension(id);

        id = id.replace(/\?.+$/, "");

        const { code, map } = await transformFile(id, {
          filename: id,
          configFile: false,
          module: { type: "es6" },
          jsc: {
            target: "esnext",
            parser: {
              syntax: currentFileExtension === ".tsx" ? "typescript" : "ecmascript",
              jsx: true,
              tsx: currentFileExtension === ".tsx",
            },
            experimental: {
              plugins: [
                [
                  resolve(__dirname, "../node_modules/@moneko/jsx-dom-expressions/jsx-dom-expressions.wasm"),
                  { module_name: "solid-js/web" },
                ],
              ],
            },
          },
          sourceMaps: true,
        });

        return { code: code, map };
      },
    },
  };
};
