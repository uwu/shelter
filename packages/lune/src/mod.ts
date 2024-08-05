// this is the file imported by packages, not ran by the CLI
import type { LuneCfg } from "./config.js";

export const defineConfig = (cfg: LuneCfg) => cfg;
