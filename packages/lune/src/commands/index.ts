import dev from "./dev";
import init from "./init";
import build from "./build";
import ci from "./ci";

export interface Command {
  argSchema: Record<string, "bool" | "str">;
  exec(args: string[] & Record<string, string | boolean>): number | void | Promise<number | void>;
  helpText: string;
}

export const commands: Record<string, Command> = { dev, init, build, ci };
