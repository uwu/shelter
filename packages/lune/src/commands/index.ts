import dev from "./dev.js";
import init from "./init.js";
import build from "./build.js";

export interface Command {
  argSchema: Record<string, "bool" | "str">;
  exec(args: string[] & Record<string, string | boolean>): number | void | Promise<number | void>;
  helpText: string;
}

export const commands: Record<string, Command> = { dev, init, build };
