import type { Command } from ".";
import { hrtime } from "process";
import { resolve } from "path";
import { existsSync } from "fs";
import { readdir, rm } from "fs/promises";
import { buildPlugin, loadCfg } from "../builder.js";

export default {
  helpText: `ci build: Build all plugins in the current monorepo

ci build <path>: Build all plugins in the target monorepo

Please see the docs sections on monorepos and configuring Lune for more info.

If you have multiple plugins in a single repo, this lets you build them all in bulk.

WARNING: if it exists, this command WILL delete the to directory silently.
This is expected to be okay in 99% of cases, but make sure when setting your scripts up that you get it right.

Options:
  --to: The directory to build the plugin into
  --dev: Disables minification
  --cfg: Specifies the path to a lune cfg file (default: ./lune.config.js)`,
  argSchema: {
    dev: "bool",
    to: "str",
    cfg: "str",
  },
  async exec(args) {
    const repoRoot = args[0] ?? ".";

    const distDir = resolve(repoRoot, (args.to as string) ?? "dist");
    if (existsSync(distDir)) await rm(distDir, { recursive: true });

    const timeBefore = hrtime.bigint();

    const cfg = await loadCfg(resolve(repoRoot, (args.cfg as string) ?? "lune.config.js"));

    const pluginsDir = resolve(repoRoot, cfg.repoSubDir ?? "plugins");
    const pluginDirs = await readdir(pluginsDir);

    for (const plug of pluginDirs) {
      const dir = resolve(pluginsDir, plug);
      await buildPlugin(dir, resolve(distDir, plug), cfg, args.dev as boolean);
    }

    const timeAfter = hrtime.bigint();

    console.log(`Built ${pluginDirs.length} plugins successfully in ${(timeAfter - timeBefore) / 1000000n}ms`);
  },
} as Command;
