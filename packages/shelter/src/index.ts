import * as patcher from "spitroast";
import * as ui from "@uwu/shelter-ui";
import * as util from "./util";
import * as plugins from "./plugins";
import { initSettings, removeAllSections, setInjectorSections } from "./settings";
import { initDispatchLogger } from "./flux";
import { unobserve } from "./observer";
import windowApi from "./windowApi";
import { sleep } from "./util";
import { initDevmode } from "./devmode";
import { unpatchHttpHandlers } from "./http";
import initModalFix from "./modalFix";
import { createEffect } from "solid-js";

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
    initModalFix(),
    ui.cleanupCss,
    waitForAppMount().then(ui.initToasts),
    patcher.unpatchAll,
    unobserve,
    removeAllSections,
    unpatchHttpHandlers,
  ]);

  ui.injectInternalStyles();

  window["shelter"] = await windowApi(unloads);

  // shelter injector settings support
  // used for injectors and custom clients such as the web ext, desktop inj, armcord, to use our settings services cleanly
  // @ts-expect-error this is either a window global, or passed to shelter via the same kind of hacks used for shelterPluginEdition, so check with typeof, not window[]
  if (typeof SHELTER_INJECTOR_SETTINGS !== undefined) {
    // @ts-expect-error
    const injSettings = SHELTER_INJECTOR_SETTINGS;
    createEffect(() => {
      let sections = typeof injSettings === "function" ? injSettings() : injSettings;
      if (Array.isArray(sections)) setInjectorSections(sections);
      else util.log("injector settings must be an array of sections or a signal getter for array of sections", "error");
    });
  }

  // once everything is fully inited, start plugins
  // devmode uses plugins functionality
  unloads.push(await plugins.startAllPlugins(), await initDevmode());

  util.log(`shelter is initialized. took: ${(performance.now() - start).toFixed(1)}ms`);
})();
