import * as flux from "./flux";
import * as patcher from "spitroast";
import * as solid from "solid-js";
import * as solidStore from "solid-js/store";
import * as solidWeb from "solid-js/web";
import * as ui from "shelter-ui";
import * as reacts from "shelter-ui/src/react";
import * as util from "./util";
import * as plugins from "./plugins";
import { registerSection } from "./settings";
import * as storage from "./storage";
import { observe } from "./observer";

function without<T extends Record<string, any>>(object: T, ...keys: string[]) {
  const cloned = { ...object };
  keys.forEach((k) => delete cloned[k]);
  return cloned;
}

const windowApi = async (unloads) => ({
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
  settings: {
    registerSection,
  },
  unload: () => unloads.forEach((p) => p()),
  // as much as it pains me to do this...
  ...reacts,
});

export default windowApi;

export type ShelterApi = Awaited<ReturnType<typeof windowApi>>;
