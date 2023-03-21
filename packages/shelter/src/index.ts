import * as patcher from "spitroast";
import * as ui from "shelter-ui";
import * as util from "./util";
import * as plugins from "./plugins";
import { initSettings, removeAllSections } from "./settings";
import { initDispatchLogger } from "./dispatchLogger";
import { unobserve } from "./observer";
import windowApi from "./windowApi";
import { sleep } from "./util";
import { initDevmode } from "./devmode";

// very temporary
import * as devmode from "./devmode";

const start = performance.now();
util.log("shelter is initializing...");

const waitForAppMount = async () => {
  let appMount: HTMLDivElement;
  while (!appMount) {
    appMount = document.getElementById("app-mount") as HTMLDivElement;
    await sleep();
  }

  while (appMount.childElementCount === 0) await sleep();

  return appMount;
};

(async () => {
  // load everything in parallel
  const unloads = await Promise.all([
    initSettings(),
    initDispatchLogger(),
    ui.cleanupCss,
    waitForAppMount().then(ui.initToasts),
    patcher.unpatchAll,
    unobserve,
    removeAllSections,
    initDevmode(),
  ]);

  window["shelter"] = await windowApi(unloads);

  // once everything is fully inited, start plugins
  unloads.push(await plugins.startAllPlugins());

  util.log(`shelter is initialized. took: ${(performance.now() - start).toFixed(1)}ms`);

  // very temporary
  window["shelterdevmode"] = devmode;
})();
