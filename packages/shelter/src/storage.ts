import { createSignal, Signal } from "solid-js";
import { IDBPDatabase, openDB } from "idb";

// can't use a solid store as i could do with bespoke logic for idb
// so heres a custom proxy impl -- sink

// we need a number thats always bigger than last time for idb reasons
let incr = 0;
const bigNumber = Date.now() + incr++;

export const storage = (name: string) => {
  const signals: Record<string, Signal<any>> = {};
  let db: IDBPDatabase<any>;

  // queues callbacks for when the db loads
  const queueStore: (() => void)[] = [];
  const queue = (cb: () => void) => (db ? cb() : queueStore.push(cb));

  openDB("shelter", bigNumber, {
    upgrade(udb) {
      if (!udb.objectStoreNames.contains(name)) udb.createObjectStore(name);
    },
  }).then(async (d) => {
    db = d;

    const keys = await db.getAllKeys(name);
    Promise.all(keys.map(async (k) => [k, await db.get(name, k)])).then((vals) => {
      for (const [k, v] of vals) {
        if (!signals.hasOwnProperty(k)) {
          signals[k] = createSignal(v);
        }
      }
    });

    queueStore.forEach((cb) => cb());
  });

  return new Proxy({} as Record<string, any>, {
    get(_, p) {
      if (typeof p === "symbol") throw new Error("cannot index db store with a symbol");

      if (signals[p]) return signals[p][0]();

      const [sig, setsig] = (signals[p] = createSignal());
      queue(() => db.get(name, p).then((v) => setsig(() => v)));
      return sig();
    },

    set(_, p, v) {
      if (typeof p === "symbol") throw new Error("cannot index db store with a symbol");

      if (!signals[p]) signals[p] = createSignal();
      const [, setsig] = signals[p];
      setsig(() => v);

      queue(() => db.put(name, v, p));

      return true;
    },

    deleteProperty(_, p) {
      if (typeof p === "symbol") throw new Error("cannot index db store with a symbol");

      delete signals[p];
      queue(() => db.delete(name, p));

      return true;
    },
  });
};

export const dbStore = storage("dbstore");
