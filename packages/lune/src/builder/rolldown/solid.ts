import { transformAsync, type TransformOptions } from "@babel/core";
import ts from "@babel/preset-typescript";
import solid from "babel-preset-solid";
import type { Plugin } from "rolldown";

function getExtension(filename: string): string {
  const index = filename.lastIndexOf(".");
  return index < 0 ? "" : filename.substring(index).replace(/\?.+$/, "");
}

export const SolidPlugin = (): Plugin => {
  let projectRoot = process.cwd();
  return {
    name: "lune:rolldown:solid-js",
    transform: {
      // Handle only .tsx and .jsx files
      filter: { id: /(\.tsx|\.jsx)$/ },
      handler: async (source, id) => {
        const currentFileExtension = getExtension(id);

        const solidOptions = { generate: "dom", hydratable: true };

        id = id.replace(/\?.+$/, "");

        const babelOptions: TransformOptions = {
          babelrc: false,
          configFile: false,
          root: projectRoot,
          filename: id,
          sourceFileName: id,
          presets: [[solid, { ...solidOptions }]],
          plugins: [],
          sourceMaps: true,
        };

        const shouldBeProcessedWithTypescript = currentFileExtension === ".tsx";

        if (shouldBeProcessedWithTypescript) {
          babelOptions.presets!.push([ts, {}]);
        }

        const { code, map } = (await transformAsync(source, babelOptions)) ?? {};

        return { code: code ?? "", map };
      },
    },
  };
};
