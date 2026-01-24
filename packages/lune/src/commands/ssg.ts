import type { Command } from ".";

import { loadCfg, loadNearestCfgOrDefault } from "../config.js";
import { resolve, relative, basename } from "path";
import { readdir } from "fs/promises";
import { buildIndexAndStyles, buildPluginPage } from "../ssg";

export default {
  helpText: `lune ssg: Build a static website for your plugin or monorepo

lune ssg single <path>: Build a static page for one plugin.
lune ssg ci     <path>: Build a static site with a page for all plugins in your monorepo
                        and an index page with a list of plugins.

Please see the docs page on configuring Lune SSG for more info, including customising the templates.

If you are trying to use this in a script to build all plugins in a repo, you probably want lune ci.

Options:
  --to: The directory to build the site into (default: "./dist")
  --repoSubDir: The subdir containing plugins in a monorepo (default: "plugins")
  --cfg: Path to a lune.config.js file to use for all plugins (default: nearest lune.config.js to the plugin)`,
  argSchema: {
    to: "str",
    cfg: "str",
    repoSubDir: "str",
  },
  async exec(args) {
    const ssgType = args[0];

    let isCi: boolean;
    switch (ssgType) {
      case "ci":
        isCi = true;
        break;
      case "single":
        isCi = false;
        break;
      default:
        console.error(
          "Did not see either `ci` or `single` in your `lune ssg` call. You must call either `lune ssg ci` or `lune ssg single`.",
        );
        return;
    }

    const dir = args[1] ?? process.cwd();

    const distDir = resolve(dir, (args.to as string) ?? "dist");

    const repoCfg = (await loadCfg(args.cfg as string)) ?? (await loadNearestCfgOrDefault(dir));

    if (isCi) {
      const pluginsDir = resolve(dir, (args.repoSubDir as string) ?? "plugins");
      const pluginNames = await readdir(pluginsDir);

      await buildIndexAndStyles(dir, pluginsDir, pluginNames, distDir, repoCfg?.ssg ?? {});

      // build plugin pages
      for (const plug of pluginNames) {
        const plugDir = resolve(pluginsDir, plug);
        const pluginCfg = repoCfg ?? (await loadNearestCfgOrDefault(plugDir));

        await buildPluginPage(plugDir, resolve(distDir, plug), pluginCfg?.ssg ?? {}, true, relative(plugDir, dir));
      }
    } else {
      // just build the one!
      await buildPluginPage(dir, distDir, repoCfg?.ssg ?? {}, false);
    }

    console.log(`Built static site to ${relative(process.cwd(), distDir)}`);
  },
} as Command;
