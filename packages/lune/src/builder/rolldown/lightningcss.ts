import type { LoadResult, Plugin } from "rolldown";
import { bundleAsync } from "lightningcss";
import { LuneCfg } from "../../config";

const CSS_LANGS_RE = /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/;

export const LightningCSSPlugin = (cfg: LuneCfg): Plugin => {
  return {
    name: "lune:rolldown:lightningcss",
    load: {
      filter: {
        id: CSS_LANGS_RE,
      },
      async handler(id) {
        const result = await bundleAsync({
          filename: id,
          minify: cfg.minify,
          cssModules: cfg.cssModules === true, //cssModuleRE.test(id),
          sourceMap: false,
          analyzeDependencies: true,
        });

        const css = new TextDecoder().decode(result.code);

        const exportsMap = JSON.stringify(
          Object.fromEntries(
            Object.entries(result.exports ?? {}).map(([origName, export_]) => [origName, export_.name]),
          ),
        );

        const cssStrLit = "`" + css.replaceAll("\\", "\\\\").replaceAll("`", "\\`") + "`";

        const injectionCode =
          cfg.cssModules === "legacy"
            ? `export const classes = ${exportsMap}; export const css = ${cssStrLit}`
            : `shelter.plugin.scoped.ui.injectCss(${cssStrLit}); export default ${exportsMap};`;

        return {
          code: injectionCode,
          moduleType: "js",
        } satisfies LoadResult;
      },
    },
  };
};
