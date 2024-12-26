import type { Command } from ".";

import { hrtime } from "process";
import { buildPlugin } from "../builder";
import { loadCfg, loadNearestCfgOrDefault } from "../config.js";

export default {
  helpText: `lune build: Build the plugin in the current directory

lune build <path>: Build the plugin in the specified directory

Please see the docs section on configuring Lune for more info.

If you are trying to use this in a script to build all plugins in a repo, you probably want lune ci.

Options:
  --dev: Disables minification
  --to: The directory to build the plugin into (default: "./dist")
  --cfg: Specifies the path to a lune cfg file (default: nearest lune.config.js to the plugin)`,
  argSchema: {
    dev: "bool",
    to: "str",
    cfg: "str",
  },
  async exec(args) {
    const dir = args[0] ?? process.cwd();

    const timeBefore = hrtime.bigint();

    const cfg = (await loadCfg(args.cfg as string)) ?? (await loadNearestCfgOrDefault(dir));

    console.log("Builder:", cfg.builder);

    await buildPlugin(dir, (args.to as string) ?? "dist", cfg, (args.dev as boolean) ?? cfg.minify);

    const timeAfter = hrtime.bigint();

    console.log(`Built successfully in ${(timeAfter - timeBefore) / 1000000n}ms`);
  },
} as Command;
