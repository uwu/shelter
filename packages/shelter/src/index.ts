import { FluxStores, getDispatcher } from "./dispatcher";
import * as patcher from "spitroast";
import * as solid from "solid-js";
import * as util from "./util";
import * as ui from "shelter-ui";
import { initSettings } from "./settings";

// We can move this somewhere else, I just put it here for now.
function log(text) {
  console.log(
    "%cshelter%c",
    "background: linear-gradient(180deg, #2A3B4B 0%, #2BFAAC 343.17%); color: white; padding: 6px",
    "",
    text
  );
}

const start = performance.now();
log("shelter is initializing...");

getDispatcher().then(async (FluxDispatcher) => {
  // load all the things in parallel :D
  const unloads = await Promise.all([
    ui.initCss(),
    initSettings()
  ]);

  // We can potentially move the window obj to it's own module later, I think it'd help with typedefs?
  window["shelter"] = {
    FluxDispatcher,
    patcher,
    solid,
    util,
    FluxStores,
    ui: { ...ui, initCss: undefined },
    unload: () => unloads.forEach((p) => p()),
  };

  log(`shelter is initialized. took: ${(performance.now() - start).toFixed(1)}ms`);
});
