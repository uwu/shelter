import type { Command } from ".";
import { createInterface } from "readline/promises";
import { stdin, stdout, cwd } from "process";
import { resolve } from "path";
import { writeFile, mkdir } from "fs/promises";

async function readline(prompt: string): Promise<string> {
  const int = createInterface(stdin, stdout);
  const answer = await int.question(prompt);
  int.close();
  return answer;
}

export default {
  helpText: `lune init: interactively init a plugin in this directory

lune init <name>: non-interactively init a plugin in a subdirectory

You may use "." as the name to use the name of the current directory.

Options:
  --author: Sets the author field of the manifest
  --desc:   Sets the description field of the manifest`,
  argSchema: {
    author: "str",
    desc: "str",
  },
  async exec(args) {
    let name = args[0];
    let author = typeof args.author === "string" ? args.author : "";
    let desc = typeof args.desc === "string" ? args.desc : "";

    if (name === ".") {
      const workingDir = cwd().split(/[\/\\]/g);
      name = workingDir[workingDir.length - 1];
    }

    if (!name) {
      name = await readline("What is your plugin called? ");

      if (!author) author = await readline("Who wrote your plugin? ");
      if (!desc) desc = await readline("Please write a short one-line description of your plugin:\n");
    }

    await createPlugin(args[0] === "." ? cwd() : resolve(cwd(), name), name, author, desc);
    console.log("Generated plugin successfully - open index.jsx to get started!");
    console.log("Feel free to rename index.jsx to index.js, index.ts, or index.tsx.");
  },
} as Command;

async function createPlugin(dir: string, name: string, author: string, desc: string) {
  await mkdir(dir, { recursive: true });

  await writeFile(
    resolve(dir, "plugin.json"),
    JSON.stringify(
      {
        name,
        author,
        description: desc,
      },
      null,
      2,
    ),
  );

  await writeFile(
    resolve(dir, "index.jsx"),
    `
const {
} = shelter;

export function onLoad() { // optional
}

export function onUnload() { // required
}`.trim(),
  );
}
