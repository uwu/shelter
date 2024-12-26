import type { Plugin } from "rolldown";
import { bundleAsync } from "lightningcss";

const CSS_LANGS_RE = /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/;
const cssModuleRE = new RegExp(`\\.module${CSS_LANGS_RE.source}`);

export const LightningCSSPlugin = (minify: boolean, root: string): Plugin => {
  let decoder = new TextDecoder();
  return {
    name: "lune:rolldown:lightningcss",
    transform: {
      filter: {
        id: CSS_LANGS_RE,
      },
      handler: async (_code, id) => {
        const result = await bundleAsync({
          filename: id,
          minify,
          cssModules: cssModuleRE.test(id),
          sourceMap: true,
          projectRoot: root,
          analyzeDependencies: true,
        });

        return decoder.decode(result.code);
      },
    },
  };
};
