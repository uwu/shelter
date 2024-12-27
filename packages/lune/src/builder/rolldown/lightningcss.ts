import type { LoadResult, Plugin } from "rolldown";
import type { LuneCfg } from "../../config";
import { readFile } from "fs/promises";

const CSS_LANGS_RE = /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/;
const SCSS_RE = /\.(scss|sass)(?:$|\?)/;

export const LightningCSSPlugin = async (cfg: LuneCfg): Promise<Plugin> => {
  const { compileAsync } = await import("sass");
  const { transform } = await import("lightningcss");

  return {
    name: "lune:rolldown:lightningcss",
    load: {
      filter: {
        id: CSS_LANGS_RE,
      },
      async handler(id) {
        let css: string;

        // Handle scss/sass files ourselves by default
        if (SCSS_RE.test(id)) {
          const sassResult = await compileAsync(id, {
            style: cfg.minify ? "compressed" : "expanded", // TODO: Make this configurable?
            sourceMap: false,
          });
          css = sassResult.css;
        } else {
          // Handle regular CSS files as is
          css = await readFile(id, "utf-8");
        }

        const { code, exports } = transform({
          code: Buffer.from(css),
          filename: id,
          minify: cfg.minify,
          cssModules: cfg.cssModules === true,
          sourceMap: false,
          analyzeDependencies: true,
        });

        const result = new TextDecoder().decode(code);

        const exportsMap = JSON.stringify(
          Object.fromEntries(Object.entries(exports ?? {}).map(([origName, export_]) => [origName, export_.name])),
        );

        const cssStrLit = "`" + result.replaceAll("\\", "\\\\").replaceAll("`", "\\`") + "`";

        const injectionCode = cfg.cssModules
          ? cfg.cssModules === "legacy"
            ? `export const classes = ${exportsMap}; export const css = ${cssStrLit}`
            : `shelter.plugin.scoped.ui.injectCss(${cssStrLit}); export default ${exportsMap};`
          : `export default ${cssStrLit}`;

        return {
          code: injectionCode,
          moduleType: "js",
        } satisfies LoadResult;
      },
    },
  };
};
