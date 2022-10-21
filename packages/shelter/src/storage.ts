import { batch, createSignal, Signal } from "solid-js";
import { IDBPDatabase, openDB } from "idb";

// can't use a solid store as i could do with bespoke logic for idb
// so heres a custom proxy impl -- sink

const symWait = Symbol();
const symDb = Symbol();
const symSig = Symbol();

interface ShelterStore<T> {
  [_: string]: T;

  [symWait]: (cb: () => void) => void;
  [symDb]: IDBPDatabase<any>;
  [symSig]: () => Record<string, T>;
}

// we have to mutex opening the db for adding new stores etc to work correctly
let storesToAdd: string[] = [];
let getDbPromise: Promise<IDBPDatabase<any>>;

async function getDb(store: string) {
  storesToAdd.push(store);

  if (storesToAdd.length > 1) return getDbPromise;

  const prom = openDB("shelter", Date.now(), {
    upgrade(udb) {
      for (const name of storesToAdd) if (!udb.objectStoreNames.contains(name)) udb.createObjectStore(name);
    },
  }).then((db) => {
    storesToAdd = [];

    return db;
  });

  return (getDbPromise = prom);
}

export const storage = <T = any>(name: string) => {
  const signals: Record<string, Signal<any>> = {};
  let db: IDBPDatabase<any>;

  // queues callbacks for when the db loads
  const waitQueue: (() => void)[] = [];
  const waitInit = (cb: () => void) => (db ? cb() : waitQueue.push(cb));

  const [mainSignal, setMainSignal] = createSignal({});
  const updateMainSignal = () => {
    const o = {};
    for (const k in signals) o[k] = signals[k][0]();
    setMainSignal(o);
  };

  getDb(name).then(async (d) => {
    db = d;

    const keys = await db.getAllKeys(name);
    await Promise.all(keys.map(async (k) => [k, await db.get(name, k)])).then((vals) => {
      for (const [k, v] of vals) {
        if (!signals.hasOwnProperty(k)) {
          signals[k] = createSignal(v);
        }
      }
      updateMainSignal();
    });

    waitQueue.forEach((cb) => cb());
  });

  return new Proxy(<ShelterStore<T>>{}, {
    get(_, p) {
      // internal things
      if (p === symWait) return waitInit;
      if (p === symDb) return db;
      if (p === symSig) return mainSignal;

      // etc
      if (typeof p === "symbol") throw new Error("cannot index db store with a symbol");

      if (signals[p]) return signals[p][0]();

      const [sig, setsig] = (signals[p] = createSignal());
      waitInit(() =>
        db.get(name, p).then((v) => {
          setsig(() => v);
          updateMainSignal();
        })
      );
      return sig();
    },

    set(_, p, v) {
      if (typeof p === "symbol") throw new Error("cannot index db store with a symbol");

      if (!signals[p]) signals[p] = createSignal();
      const [, setsig] = signals[p];
      setsig(() => v);
      updateMainSignal();

      waitInit(() => db.put(name, v, p));

      return true;
    },

    deleteProperty(_, p) {
      if (typeof p === "symbol") throw new Error("cannot index db store with a symbol");

      delete signals[p];
      updateMainSignal();
      waitInit(() => db.delete(name, p));

      return true;
    },

    has: (_, p) => p in signals,

    ownKeys: () => Object.keys(signals),

    // without this, properties are not enumerable! (object.keys wouldn't work)
    getOwnPropertyDescriptor: (_, p) => ({
      value: p,
      enumerable: true,
      configurable: true,
      writable: true,
    }),
  });
};

export const dbStore = storage("dbstore");

// stuff like this is necessary when you *need* to have gets return persisted values as well as newly set ones

/** if the store is or is not yet connected to IDB */
export const isInited = (store: ShelterStore<unknown>) => !!store[symDb];
/** waits for the store to connect to IDB, then runs the callback (if connected, synchronously runs the callback now) */
export const whenInited = (store: ShelterStore<unknown>, cb: () => void) => store[symWait](cb);
/** returns a promise that resolves when the store is connected to IDB (if connected, resolves instantly) */
export const waitInit = (store: ShelterStore<unknown>) => new Promise<void>((res) => whenInited(store, res));

/** sets default values for the store. these only apply once the store connects to IDB to prevent overwriting persist */
export const defaults = <T = any>(store: ShelterStore<T>, fallbacks: Record<string, T>) =>
  whenInited(store, () =>
    batch(() => {
      for (const k in fallbacks) if (!(k in store)) store[k] = fallbacks[k];
    })
  );

/** gets a signal containing the whole store as an object */
export const signalOf = <T = any>(store: ShelterStore<T>): (() => Record<string, T>) => store[symSig];

/** wraps a solid mutable to provide a global signal */
export const solidMutWithSignal = <T extends object = any>(store: T) /*: [T, () => T]*/ => {
  const [sig, setSig] = createSignal<T>();
  const update = () => setSig(() => ({ ...store }));
  return [
    new Proxy(store, {
      set(t, p, v, r) {
        const success = Reflect.set(t, p, v, r);
        if (success) update();
        return success;
      },
      deleteProperty(t, p) {
        const success = Reflect.deleteProperty(t, p);
        if (success) update();
        return success;
      },
    }),
    sig,
  ];
};
