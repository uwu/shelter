import * as flux from "./flux";
import * as patcher from "spitroast";
import * as solid from "solid-js";
import * as solidStore from "solid-js/store";
import * as solidWeb from "solid-js/web";
import * as ui from "@uwu/shelter-ui";
import * as reacts from "./react";
import * as bridges from "./bridges";
import * as util from "./util";
import { registerSection } from "./settings";
import * as storage from "./storage";
import { observe } from "./observer";
import http from "./http";

function without<T extends Record<string, any>, TK extends string>(object: T, ...keys: TK[]) {
  //return Object.fromEntries(Object.entries(object).filter(([k]) => !keys.includes(k as any))) as Omit<T, TK>;
  const cloned = { ...object };
  keys.forEach((k) => delete cloned[k]);
  return cloned as Omit<T, TK>;
}

const windowApi = async (unloads) => {
  const dispatcher = await flux.getDispatcher();

  return {
    flux: without(
      {
        ...flux,
        dispatcher,
      },
      "injectIntercept",
      "getDispatcher",
      "blockedSym",
      "modifiedSym",
      "initDispatchLogger",
    ),
    http,
    patcher: without(patcher, "unpatchAll"),
    solid,
    solidStore,
    solidWeb,
    util: {
      ...util,
      createScopedApi: util.createScopedApi.bind(undefined, dispatcher),
    },
    storage,
    observeDom: observe,
    ui: {
      ...without(ui, "cleanupCss", "initToasts"),
      ...bridges,
    },
    settings: {
      registerSection,
    },
    unload: () => unloads.forEach((p) => p?.()),
    // as much as it pains me to do this...
    ...reacts,
  };
};

export default windowApi;

export type ShelterApi = Awaited<ReturnType<typeof windowApi>>;
