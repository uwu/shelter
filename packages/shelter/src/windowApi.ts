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

function without<T extends Record<string, any>, TK extends string>(object: T, ...keys: TK[]) {
  //return Object.fromEntries(Object.entries(object).filter(([k]) => !keys.includes(k as any))) as Omit<T, TK>;
  const cloned = { ...object };
  keys.forEach((k) => delete cloned[k]);
  return cloned as Omit<T, TK>;
}

const windowApi = async (unloads) => ({
  flux: without(
    {
      ...flux,
      dispatcher: await flux.getDispatcher(),
    },
    "injectIntercept",
    "getDispatcher",
    "blockedSym",
    "modifiedSym",
  ),
  patcher: without(patcher, "unpatchAll"),
  solid,
  solidStore,
  solidWeb,
  util,
  plugins: without(plugins, "startAllPlugins", "devmodePrivateApis"),
  storage: without(storage, "dbStore"),
  observeDom: observe,
  ui: without(ui, "cleanupCss", "initToasts"),
  settings: {
    registerSection,
  },
  unload: () => unloads.forEach((p) => p?.()),
  // as much as it pains me to do this...
  ...reacts,
});

export default windowApi;

export type ShelterApi = Awaited<ReturnType<typeof windowApi>>;
