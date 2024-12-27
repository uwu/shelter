import type { LuneCfg } from "../../config";
import { readFile } from "fs/promises";

export const CSS_LANGS_RE = /\.(css|s[ac]ss)(?:$|\?)/;
export const SCSS_RE = /\.(s[ac]ss)(?:$|\?)/;

export async function processCss(cfg: LuneCfg, path: string): Promise<string> {
  const { compileAsync } = await import("sass");
  const { transform } = await import("lightningcss");

  let css: string;

  // Handle scss/sass files ourselves by default
  if (SCSS_RE.test(path)) {
    const sassResult = await compileAsync(path, {
      style: cfg.minify ? "compressed" : "expanded", // TODO: Make this configurable?
      sourceMap: false,
    });
    css = sassResult.css;
  } else {
    // Handle regular CSS files as is
    css = await readFile(path, "utf-8");
  }

  const { code, exports } = transform({
    code: Buffer.from(css),
    filename: path,
    minify: cfg.minify,
    cssModules: !!cfg.cssModules,
    sourceMap: false,
    analyzeDependencies: true,
  });

  const result = new TextDecoder().decode(code);

  const exportsMap = JSON.stringify(
    Object.fromEntries(Object.entries(exports ?? {}).map(([origName, export_]) => [origName, export_.name])),
  );

  const cssStrLit = "`" + result.replaceAll(/([$`\\])/g, "\\$1") + "`";

  return cfg.cssModules
    ? cfg.cssModules === "legacy"
      ? `export const classes = ${exportsMap}; export const css = ${cssStrLit}`
      : `shelter.plugin.scoped.ui.injectCss(${cssStrLit}); export default ${exportsMap};`
    : `export default ${cssStrLit}`;
}
