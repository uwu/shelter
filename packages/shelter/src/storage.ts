import { createSignal, Signal } from "solid-js";
import { openDB } from "idb";

// can't use a solid store as i could do with bespoke logic for idb
// so heres a custom proxy impl -- sink

export default async (name: string) => {
  const db = await openDB("shelter", 1);

  const signals: Record<string, Signal<any>> = {};

  db.getAllKeys(name)
    .then((keys) => Promise.all(keys.map(async (k) => [k, await db.get(name, k)])))
    .then((vals) => {
      for (const [k, v] of vals) {
        if (!signals.hasOwnProperty(k)) {
          signals[k] = createSignal(v);
        }
      }
    });

  return new Proxy({} as Record<string, any>, {
    get(_, p) {
      if (typeof p === "symbol") throw new Error("cannot index db store with a symbol");

      if (signals[p]) return signals[p][0]();

      signals[p] = createSignal();
      db.get(name, p).then((v) => signals[p][1](() => v));
      return signals[p][0]();
    },

    set(_, p, v) {
      if (typeof p === "symbol") throw new Error("cannot index db store with a symbol");

      if (!signals[p]) signals[p] = createSignal();
      signals[p][1](() => v);

      db.put(name, v, p);

      return true;
    },

    deleteProperty(_, p) {
      if (typeof p === "symbol") throw new Error("cannot index db store with a symbol");

      delete signals[p];
      db.delete(name, p);

      return true;
    },
  });
};
