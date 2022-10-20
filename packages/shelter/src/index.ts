import { FluxStores, getDispatcher } from "./dispatcher";
import * as patcher from "spitroast";
import * as solid from "solid-js";
import * as solidStore from "solid-js/store";
import * as solidWeb from "solid-js/web";
import * as ui from "shelter-ui";
import * as util from "./util";
import * as plugins from "./plugins";
import { initSettings } from "./settings";
import { initDispatchLogger } from "./dispatchLogger";
import { dbStore } from "./storage";

const start = performance.now();
util.log("shelter is initializing...");

getDispatcher().then(async (FluxDispatcher) => {
  // load all the things in parallel :D
  const unloads = await Promise.all([
    initSettings(),
    initDispatchLogger(),
    plugins.initAllPlugins(),
    ui.cleanupCss,
    patcher.unpatchAll,
  ]);

  // We can potentially move the window obj to it's own module later, I think it'd help with typedefs?
  window["shelter"] = {
    FluxDispatcher,
    patcher,
    solid,
    solidStore,
    solidWeb,
    util,
    plugins: { ...plugins, initAllPlugins: undefined },
    FluxStores,
    dbStore,
    ui: { ...ui, cleanupCss: undefined },
    unload: () => unloads.forEach((p) => p()),
  };

  util.log(`shelter is initialized. took: ${(performance.now() - start).toFixed(1)}ms`);
});
