import * as flux from "./flux";
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
import { observe, unobserve } from "./observer";

function without<T extends Record<string, any>>(object: T, ...keys: string[]) {
  const cloned = { ...object };
  keys.forEach((k) => delete cloned[k]);
  return cloned;
}

const start = performance.now();
util.log("shelter is initializing...");

(async () => {
  // load all the things in parallel :D
  const unloads = await Promise.all([
    initSettings(),
    initDispatchLogger(),
    ui.cleanupCss,
    patcher.unpatchAll,
    unobserve,
  ]);

  // We can potentially move the window obj to it's own module later, I think it'd help with typedefs?
  window["shelter"] = {
    flux: without(
      {
        ...flux,
        dispatcher: await flux.getDispatcher(),
      },
      "injectIntercept",
      "getDispatcher"
    ),
    patcher: without(patcher, "unpatchAll"),
    solid,
    solidStore,
    solidWeb,
    util,
    plugins: without(plugins, "startAllPlugins"),
    storage,
    observeDom: observe,
    ui: without(ui, "cleanupCss"),
    unload: () => unloads.forEach((p) => p()),
  };

  // this one should run last!
  unloads.push(await plugins.startAllPlugins());

  util.log(`shelter is initialized. took: ${(performance.now() - start).toFixed(1)}ms`);
})();
