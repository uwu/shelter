import type { Command } from ".";
import { hrtime } from "process";
import { resolve } from "path";
import { buildPlugin, loadCfg } from "../builder.js";

export default {
  helpText: `lune build: Build the plugin in the current directory

lune build <path>: Build the plugin in the specified directory

Please see the docs section on configuring Lune for more info.

If you are trying to use this in a script to build all plugins in a repo, you probably want lune ci.

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
    const dir = args[0] ?? ".";

    const timeBefore = hrtime.bigint();

    const cfg = await loadCfg((args.cfg as string) ?? resolve(dir, "lune.config.js"));
    await buildPlugin(dir, (args.to as string) ?? "./dist", cfg, args.dev as boolean);

    const timeAfter = hrtime.bigint();

    console.log(`Built successfully in ${(timeAfter - timeBefore) / 1000000n}ms`);
  },
} as Command;
