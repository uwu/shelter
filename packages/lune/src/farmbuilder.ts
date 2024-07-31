import type { FarmCLIOptions, UserConfig } from "@farmfe/core";
import { createCompiler, resolveConfig } from "@farmfe/core";
import { NoopLogger } from "@farmfe/core";

export async function buildToString(inlineConfig: FarmCLIOptions & UserConfig): Promise<string> {
  const logger = new NoopLogger();

  const resolvedUserConfig = await resolveConfig(inlineConfig, "production", logger, false);

  const compiler = await createCompiler(resolvedUserConfig, logger);
  await compiler.compile();

  return Object.entries(compiler.resources())
    .filter(([n]) => n.endsWith(".js"))
    .map(([_, f]) => f.toString())
    .join(";");
}
