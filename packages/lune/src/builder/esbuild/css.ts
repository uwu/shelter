import type { Plugin } from "esbuild";
import type { LuneCfg } from "../../config";
import { CSS_LANGS_RE, processCss } from "../shared/cssProcessor";

export const CSSPlugin = (cfg: LuneCfg): Plugin => ({
  name: "lune:esbuild:css",
  setup({ onLoad }) {
    onLoad(
      {
        filter: CSS_LANGS_RE,
      },
      async ({ path }) => ({
        contents: await processCss(cfg, path),
        loader: "js",
      }),
    );
  },
});
