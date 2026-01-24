// path/to/@uwu/lune/dist -> path/to/@uwu/lune/ssg-defaults
import { basename, resolve } from "path";
import { readdir, readFile } from "fs/promises";
import { existsSync } from "fs";

const defaultTemplateDir = resolve(__dirname, "../ssg-defaults");

// reads all templates from {path}/*.html
async function templatesFromDir(path: string) {
  const files = await readdir(path);

  const extension = ".html";

  const htmlFiles = files.filter((f) => f.endsWith(extension));
  const loadedTemplates = await Promise.all(
    htmlFiles.map(async (fname) => {
      const templateName = basename(fname, extension);

      return [templateName, await readFile(resolve(path, fname), "utf-8")] as [string, string];
    }),
  );

  return Object.fromEntries(loadedTemplates.filter((t) => !!t));
}

// cfgPath is the folder containing the config file, pluginPath is the folder containing the plugin to build
export async function resolveTemplates(cfgPath: string, pluginPath?: string) {
  const templates = {} as Record<string, string>;

  // default templates
  Object.assign(templates, await templatesFromDir(defaultTemplateDir));

  // user repo templates
  if (existsSync(resolve(cfgPath, "lune-ssg")))
    Object.assign(templates, await templatesFromDir(resolve(cfgPath, "lune-ssg")));

  // plugin specific template
  if (pluginPath && existsSync(resolve(pluginPath, "lune-ssg")))
    Object.assign(templates, await templatesFromDir(resolve(pluginPath, "lune-ssg")));

  return templates;
}

// same args as resolveTemplates
export function resolveStyles(cfgPath: string, pluginPath?: string) {
  const repoStyles = resolve(cfgPath, "lune-ssg", "styles.css");
  if (existsSync(repoStyles)) return repoStyles;

  if (pluginPath) {
    const pluginStyles = resolve(pluginPath, "lune-ssg", "styles.css");
    if (existsSync(pluginStyles)) return pluginStyles;
  }

  return resolve(defaultTemplateDir, "styles.css");
}
