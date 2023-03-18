import { readFileSync } from "fs";
import { exit } from "process";
import { URL } from "url";
import { argparse } from "./argparser.js";
import { helptext } from "./help.js";
import { commands } from "./commands/index.js";

const topLevelParsed = argparse(
  {
    help: "bool",
    version: "bool",
  },
  { dropUnknown: true },
);

if (topLevelParsed.version) {
  const ver = JSON.parse(readFileSync(new URL("../package.json", import.meta.url).pathname).toString()).version;
  console.log(`Lune ${ver} by uwu.network`);
  exit(0);
}

if (topLevelParsed.length === 0) {
  if (topLevelParsed.help) {
    console.log(helptext);
    exit(0);
  }

  console.log("You must provide at least one argument\n\n" + helptext);
  exit(1);
}

if (topLevelParsed[0] in commands) {
  const command = commands[topLevelParsed[0]];

  const parsedArgs = argparse({ ...command.argSchema, help: "bool" } as Record<string, "str" | "bool">, { skip: 1 });
  if (parsedArgs.help) console.log(command.helpText);
  else Promise.resolve(command.exec(parsedArgs)).then((res) => exit(res || 0));
} else {
  console.log(`The command ${topLevelParsed[0]} was not recognised\n\n${helptext}`);
  exit(1);
}
