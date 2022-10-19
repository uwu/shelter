import { batch, createSignal, Signal } from "solid-js";
import { IDBPDatabase, openDB } from "idb";

const symWait = Symbol();
const symDb = Symbol();

interface ShelterStore {
  [p: string]: any;

  [symWait]: (cb: () => void) => void;
  [symDb]: IDBPDatabase<any>;
}

// can't use a solid store as i could do with bespoke logic for idb
// so heres a custom proxy impl -- sink

// we need a number thats always bigger than last time for idb reasons
let incr = 0;
const bigNumber = Date.now() + incr++;

export const storage = (name: string) => {
  const signals: Record<string, Signal<any>> = {};
  let db: IDBPDatabase<any>;

  // queues callbacks for when the db loads
  const waitQueue: (() => void)[] = [];
  const waitInit = (cb: () => void) => (db ? cb() : waitQueue.push(cb));

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

    waitQueue.forEach((cb) => cb());
  });

  return new Proxy(<ShelterStore>{}, {
    get(_, p) {
      // internal things
      if (p === symWait) return waitInit;
      if (p === symDb) return db;

      // etc
      if (typeof p === "symbol") throw new Error("cannot index db store with a symbol");

      if (signals[p]) return signals[p][0]();

      const [sig, setsig] = (signals[p] = createSignal());
      waitInit(() => db.get(name, p).then((v) => setsig(() => v)));
      return sig();
    },

    set(_, p, v) {
      if (typeof p === "symbol") throw new Error("cannot index db store with a symbol");

      if (!signals[p]) signals[p] = createSignal();
      const [, setsig] = signals[p];
      setsig(() => v);

      waitInit(() => db.put(name, v, p));

      return true;
    },

    deleteProperty(_, p) {
      if (typeof p === "symbol") throw new Error("cannot index db store with a symbol");

      delete signals[p];
      waitInit(() => db.delete(name, p));

      return true;
    },

    has(_, p) {
      return signals.hasOwnProperty(p);
    },

    ownKeys() {
      return Object.keys(signals);
    },
  });
};

export const dbStore = storage("dbstore");

// stuff like this is necessary when you *need* to have gets return persisted values as well as newly set ones

/** if the store is or is not yet connected to IDB */
export const isInited = (store: ShelterStore) => !!store[symDb];
/** waits for the store to connect to IDB, then runs the callback (if connected, synchronously runs the callback now) */
export const whenInited = (store: ShelterStore, cb: () => void) => store[symWait](cb);
/** returns a promise that resolves when the store is connected to IDB (if connected, resolves instantly) */
export const waitInit = (store: ShelterStore) => new Promise<void>((res) => whenInited(store, res));

/** sets default values for the store. these only apply once the store connects to IDB to prevent overwriting persist */
export const defaults = (store: ShelterStore, fallbacks: Record<string, any>) =>
  whenInited(store, () =>
    batch(() => {
      for (const k in fallbacks) if (!(k in fallbacks)) store[k] = fallbacks[k];
    })
  );
