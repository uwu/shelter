import { createSignal, Signal } from "solid-js";
import { createStore, entries, get, set } from "idb-keyval";

// can't use a solid store as i could do with bespoke logic for idb
// so heres a custom proxy impl -- sink

const ikvStore = createStore("shltr-dbstore", "store");

const signals: Record<string, Signal<any>> = {};

entries(ikvStore).then((vals) => {
  for (const [k, v] of vals) if (typeof k === "string" && !signals[k]) signals[k] = createSignal(v);
});

export default new Proxy(signals, {
  get(_, p) {
    if (typeof p === "symbol") throw new Error("cannot index db store with a symbol");

    if (signals[p]) return signals[p][0]();

    signals[p] = createSignal();
    get(p, ikvStore).then((v) => signals[p][1](() => v));
    return signals[p][0]();
  },

  set(_, p, v) {
    if (typeof p === "symbol") throw new Error("cannot index db store with a symbol");

    if (!signals[p]) signals[p] = createSignal();
    signals[p][1](() => v);

    // noinspection JSIgnoredPromiseFromCall
    set(p, v, ikvStore);

    return true;
  },
});
