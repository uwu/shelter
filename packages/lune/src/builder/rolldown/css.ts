import type { LoadResult, Plugin } from "rolldown";
import type { LuneCfg } from "../../config";
import { CSS_LANGS_RE, processCss } from "../shared/cssProcessor";

export const CSSPlugin = (cfg: LuneCfg): Plugin => ({
  name: "lune:rolldown:css",
  load: {
    filter: {
      id: CSS_LANGS_RE,
    },
    handler: async (id) =>
      ({
        code: await processCss(cfg, id),
        moduleType: "js",
      }) satisfies LoadResult,
  },
});
