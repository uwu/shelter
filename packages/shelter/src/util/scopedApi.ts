import { log } from ".";
import { intercept as fluxIntercept } from "../flux";
import { intercept as httpIntercept } from "../http";
import { observe as observeDom } from "../observer";
import * as patcher from "spitroast";
import { registerSection } from "../settings";
import { injectCss } from "@uwu/shelter-ui";
import { Dispatcher } from "../types";

export type DisposableFn = (...props: unknown[]) => () => void;
function shimDisposableFn<F extends DisposableFn>(unpatches: (() => void)[], f: F) {
  return (...props: Parameters<F>) => {
    const up = f(...props);
    unpatches.push(up);
    return up;
  };
}

export function createScopedApi(dispatcher: Dispatcher) {
  const disposes = [];

  return {
    disposes,

    disposeAllNow() {
      for (const p of disposes) {
        try {
          p();
        } catch (e) {
          log([`Caught error while cleaning up scoped APIs, continuing safely.`, e], "error");
        }
      }
      disposes.splice(0, disposes.length);
    },

    onDispose(callback: DisposableFn) {
      disposes.push(callback);
    },

    flux: {
      subscribe(type: string, cb: (payload: any) => void) {
        dispatcher.subscribe(type, cb);
        const dispose = () => dispatcher.unsubscribe(type, cb);
        disposes.push(dispose);
        return dispose;
      },
      intercept: shimDisposableFn(disposes, fluxIntercept),
    },
    http: {
      intercept: shimDisposableFn(disposes, httpIntercept),
    },
    observeDom: shimDisposableFn(disposes, observeDom),
    patcher: {
      after: shimDisposableFn(disposes, patcher.after),
      before: shimDisposableFn(disposes, patcher.before),
      instead: shimDisposableFn(disposes, patcher.instead),
    },
    settings: {
      registerSection: shimDisposableFn(disposes, registerSection),
    },
    ui: {
      injectCss: shimDisposableFn(disposes, injectCss),
    },
  } as const;
}
