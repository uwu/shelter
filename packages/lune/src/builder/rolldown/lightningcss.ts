import type { Plugin } from "rolldown";

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
        const { bundleAsync } = await import("lightningcss").catch(() => {
          throw new Error("Failed to load LightningCSS. Please install it with `npm install lightningcss`.");
        });

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
