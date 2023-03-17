import dev from "./dev.js";

export interface Command {
  argSchema: Record<string, "bool" | "str">;
  exec(args: string[] & Record<string, string | boolean>): number | void;
  helpText: string;
}

export const commands: Record<string, Command> = { dev };
