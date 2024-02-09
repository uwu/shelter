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
import { discordHttp, intercept, ready } from "./http";
import { HTTPApi } from "./types";
import { constants } from "./constants";

function without<T extends Record<string, any>, TK extends string>(object: T, ...keys: TK[]) {
  //return Object.fromEntries(Object.entries(object).filter(([k]) => !keys.includes(k as any))) as Omit<T, TK>;
  const cloned = { ...object };
  keys.forEach((k) => delete cloned[k]);
  return cloned as Omit<T, TK>;
}

let http;
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
    get http(): HTTPApi {
      if (discordHttp === undefined) {
        return { intercept, ready };
      }

      return (http ??= {
        ...discordHttp,
        _raw: discordHttp,
        intercept,
        ready,
      });
    },
    constants,
    patcher: without(patcher, "unpatchAll"),
    solid,
    solidStore,
    solidWeb,
    util: {
      ...util,
      createScopedApi: util.createScopedApi.bind(undefined, dispatcher),
    },
    plugins: without(plugins, "startAllPlugins", "devmodePrivateApis"),
    storage,
    observeDom: observe,
    ui: without(ui, "cleanupCss", "initToasts"),
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
