import { argv } from "process";

const args = argv.slice(2);

interface ArgParserSettings {
  /** drops unknown args
   * @default false
   */
  dropUnknown?: boolean;

  /** how many args to skip at the start
   * @default 0
   */
  skip?: number;
}

export function argparse<T extends Record<string, "str" | "bool">>(opts: T, settings: ArgParserSettings = {}) {
  const resolvedSettings: Required<ArgParserSettings> = {
    dropUnknown: false,
    skip: 0,
    ...settings,
  };

  const parsed: Record<string, string | true> = {};
  const positionals: string[] = [];

  let currentOpt: string | undefined;

  for (const arg of args.slice(resolvedSettings.skip)) {
    if (currentOpt) {
      //              /- we are here
      // myapp --foo bar

      if (arg.startsWith("--")) throw new Error(`Expected a value for --${currentOpt}, found a flag ${arg}`);

      parsed[currentOpt] = arg;
      currentOpt = undefined;
      continue;
    }

    if (arg.includes("=")) {
      const split = arg.split("=");
      const argName = split[0].startsWith("--") ? split[0].slice(2) : split[0];
      const argVal = split.slice(1).join("=");

      if (opts[argName] === "bool") throw new Error(`flag=value syntax is not acceptable for boolean flag ${argName}`);

      if (!opts[argName])
        if (resolvedSettings.dropUnknown) continue;
        else throw new Error(`flag of name ${argName} is not known`);

      parsed[argName] = argVal;
      continue;
    }

    if (arg.startsWith("--")) {
      const argName = arg.slice(2);

      if (opts[argName] === "bool") parsed[argName] = true;

      if (opts[argName] === "str") currentOpt = argName;

      if (!opts[argName])
        if (resolvedSettings.dropUnknown) continue;
        else throw new Error(`flag of name ${argName} is not known`);

      continue;
    }

    positionals.push(arg);
  }

  return Object.assign([], positionals, parsed) as {
    [Key in keyof T]?: T[Key] extends "str" ? string : true;
  } & string[];
}
