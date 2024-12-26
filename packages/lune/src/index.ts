import { exit } from "process";
import { argparse } from "./argparser.js";
import { helptext } from "./help.js";
import { commands } from "./commands/index.js";
import pkg from "../package.json" assert { type: "json" };

const topLevelParsed = argparse(
  {
    help: "bool",
    version: "bool",
  },
  { dropUnknown: true },
);

if (topLevelParsed.version) {
  console.log(`Lune ${pkg.version} by uwu.network`);
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
  else {
    // @ts-expect-error undefined issues
    Promise.resolve(command.exec(parsedArgs)).then(
      (res) => res && exit(res),
      (err) => {
        console.error(err.message);
        exit(1);
      },
    );
  }
} else {
  console.log(`The command ${topLevelParsed[0]} was not recognised\n\n${helptext}`);
  exit(1);
}
