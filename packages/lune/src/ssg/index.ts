import { compile } from "handlebars";
import { resolveStyles, resolveTemplates } from "./templateLoader";
import { buildMetadata } from "./buildMetadata";
import { basename, resolve } from "path";
import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { copyFile } from "node:fs/promises";

function performTemplating(templates: Record<string, string>, name: string, meta: object) {
  const template = compile(templates[name], { noEscape: true });

  const partials = Object.fromEntries(Object.entries(templates).map(([name, template]) => [name, template])) as any;

  return template(meta, { partials });
}

/** Builds an SSG page for the index page of a repo
 * @arg repoPath - path to the root of the repo
 * @arg pluginDir - path to plugin directory container, relative to repoPath
 * @arg pluginNames - list of plugin names
 * @arg outDir - the directory to place index.html and styles.css into
 * @arg cfg - extra items to pass to templates
 */
export async function buildIndexAndStyles(
  repoPath: string,
  pluginDir: string,
  pluginNames: string[],
  outDir: string,
  cfg: object,
) {
  // read all manifests
  const manifests: Record<string, object> = {};
  for (const pluginName of pluginNames) {
    const manifestPath = resolve(repoPath, pluginDir, pluginName, "plugin.json");

    if (!existsSync(manifestPath)) continue;

    const manifestData = await readFile(manifestPath, "utf-8");

    try {
      manifests[pluginName] = { ...JSON.parse(manifestData), url: pluginName };
    } catch {
      console.warn(`Failed to parse manifest for plugin ${pluginName} while building website index, skipping`);
    }
  }

  const templates = await resolveTemplates(repoPath);

  const meta = {
    ...(await buildMetadata()),
    plugins: manifests,
    repo_name: basename(resolve(repoPath)),
    plugin_title: "",
    cond_infix_colon: "",
    cond_infix_bar: "",
    styles: "styles.css",
    ...cfg,
  };

  // generate!
  const built = performTemplating(
    {
      ...templates,
      main: templates.main_index,
    },
    "layout",
    meta,
  );

  await writeFile(resolve(outDir, "index.html"), built);

  // copy css
  const cssLocation = resolveStyles(repoPath);
  await copyFile(cssLocation, resolve(outDir, "styles.css"));
}

/** Builds an SSG page for an individual plugin's page
 * @arg pluginDir - path to the plugin directory
 * @arg outDir - the directory to place index.html into
 * @arg cfg - extra items to pass to templates
 * @arg isCi - if we should use the parent directory's styles.css, or copy our own styles.css
 * @arg repoDir - path to the repo dir from the plugin dir
 */
export async function buildPluginPage(pluginDir: string, outDir: string, cfg: object, isCi: boolean, repoDir?: string) {
  // read manifest
  const manifestPath = resolve(pluginDir, "plugin.json");

  if (!existsSync(manifestPath)) return;

  const manifestData = await readFile(manifestPath, "utf-8");

  let parsedManifest: object;
  try {
    parsedManifest = JSON.parse(manifestData);
  } catch {
    console.error(`Failed to parse manifest while building website, skipping`);
    return;
  }

  const templates = repoDir
    ? await resolveTemplates(resolve(pluginDir, repoDir), pluginDir)
    : await resolveTemplates(pluginDir);

  const repoName = repoDir && basename(resolve(pluginDir, repoDir));

  const meta = {
    ...(await buildMetadata()),
    ...parsedManifest,
    repo_name: repoName ?? "",
    plugin_title: (parsedManifest as any).name,
    cond_infix_colon: repoDir ? ": " : "",
    cond_infix_bar: repoDir ? " | " : "",
    styles: isCi ? "../styles.css" : "styles.css",
    ...cfg,
  };

  // generate!
  const built = performTemplating(
    {
      ...templates,
      main: templates.main_plugin,
    },
    "layout",
    meta,
  );

  await writeFile(resolve(outDir, "index.html"), built);

  if (!isCi) {
    // copy css
    const cssLocation = resolveStyles(pluginDir);
    await copyFile(cssLocation, resolve(outDir, "styles.css"));
  }
}
