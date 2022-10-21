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
import * as storage from "./storage";

const start = performance.now();
util.log("shelter is initializing...");

function without<T extends Record<string, any>>(object: T, ...keys: string[]) {
  const cloned = { ...object };
  keys.forEach((k) => delete cloned[k]);
  return cloned;
}

getDispatcher().then(async (FluxDispatcher) => {
  // load all the things in parallel :D
  const unloads = await Promise.all([initSettings(), initDispatchLogger(), ui.cleanupCss, patcher.unpatchAll]);

  // We can potentially move the window obj to it's own module later, I think it'd help with typedefs?
  window["shelter"] = {
    FluxDispatcher,
    patcher,
    solid,
    solidStore,
    solidWeb,
    util,
    plugins: without(plugins, "startAllPlugins"),
    FluxStores,
    storage,
    ui: without(ui, "cleanupCss"),
    unload: () => unloads.forEach((p) => p()),
  };

  // this one should run last!
  unloads.push(await plugins.startAllPlugins());

  util.log(`shelter is initialized. took: ${(performance.now() - start).toFixed(1)}ms`);
});
