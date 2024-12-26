import type { Command } from ".";

import { hrtime } from "process";
import { resolve } from "path";
import { existsSync } from "fs";
import { readdir, rm } from "fs/promises";
import { buildPlugin } from "../builder";
import { loadCfg, loadNearestCfgOrDefault } from "../config.js";

export default {
  helpText: `ci: Build all plugins in the current monorepo

ci <path>: Build all plugins in the target monorepo

Please see the docs sections on monorepos and configuring Lune for more info.

If you have multiple plugins in a single repo, this lets you build them all in bulk.

WARNING: if it exists, this command WILL delete the to directory silently.
This is expected to be okay in 99% of cases, but make sure when setting your scripts up that you get it right.

Options:
  --dev: Disables minification
  --to: The directory to build the plugin into (default: "./dist")
  --repoSubDir: The subdir containing plugins in a monorepo (default: "plugins")
  --cfg: Path to a lune.config.js file to use for all plugins (default: nearest lune.config.js to the plugin)`,
  argSchema: {
    dev: "bool",
    to: "str",
    cfg: "str",
    repoSubDir: "str",
  },
  async exec(args) {
    const dir = args[0] ?? process.cwd();

    const distDir = resolve(dir, (args.to as string) ?? "dist");
    if (existsSync(distDir)) await rm(distDir, { recursive: true });

    const timeBefore = hrtime.bigint();

    const specifiedCfg = await loadCfg(args.cfg as string);

    const pluginsDir = resolve(dir, (args.repoSubDir as string) ?? "plugins");
    const pluginDirs = await readdir(pluginsDir);

    let successes = 0;
    let errors = 0;

    for (const plug of pluginDirs) {
      const dir = resolve(pluginsDir, plug);
      try {
        const cfg = specifiedCfg ?? (await loadNearestCfgOrDefault(dir));
        await buildPlugin(dir, resolve(distDir, plug), cfg, (args.dev as boolean) ?? cfg.minify);
        successes++;
      } catch (e) {
        console.error(`Building ${plug} failed: ${e.message}`);
        errors++;
      }
    }

    const timeAfter = hrtime.bigint();

    console.log(
      `Built ${successes} plugins successfully (${errors} failed) in ${(timeAfter - timeBefore) / 1000000n}ms`,
    );
  },
} as Command;
