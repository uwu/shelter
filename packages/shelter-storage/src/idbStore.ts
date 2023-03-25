import { batch, createSignal, Signal } from "solid-js";
import { IDBPDatabase, openDB } from "idb";
import { makeDeepProxy } from "./deep";

// idb cannot directly store proxies so this clones them
function cloneRec(node: unknown, seenNodes: object[] = []) {
  switch (typeof node) {
    case "function":
    case "symbol":
      console.error(`can't store a ${typeof node} in a shelter IDB store!`);
      return undefined;

    case "object":
      if (seenNodes?.includes(node)) throw new Error("can't store a circular reference in a shelter storage!");

      const newObj = Array.isArray(node) ? [] : {};
      for (const k of Object.keys(node)) {
        newObj[k] = cloneRec(node[k], [...seenNodes, node]);
      }
      return newObj;

    default:
      return node as undefined | boolean | number | string | bigint;
  }
}

const symWait = Symbol();
const symDb = Symbol();
const symSig = Symbol();

export interface IdbStore<T> {
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

export const idbStore = <T = any>(name: string) => {
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
    waitQueue.splice(0, waitQueue.length);
  });

  return makeDeepProxy({
    get(_, p) {
      // internal things
      if (p === symWait) return waitInit;
      if (p === symDb) return db;
      if (p === symSig) return mainSignal;

      // etc
      if (typeof p === "symbol") throw new Error("cannot index idb store with a symbol");

      if (signals[p]) return signals[p][0]();

      const [sig, setsig] = (signals[p] = createSignal());
      waitInit(() =>
        db.get(name, p).then((v) => {
          setsig(() => v);
          updateMainSignal();
        }),
      );
      return sig();
    },

    set(path, p, v) {
      debugger;

      if (typeof p === "symbol") throw new Error("cannot index idb store with a symbol");

      const resolvedPath = [...path, p];

      if (!signals[p]) signals[p] = createSignal();
      const [, setsig] = signals[p];
      setsig(() => v);
      updateMainSignal();

      waitInit(() => db.put(name, cloneRec(v), p));

      return true;
    },

    deleteProperty(_, p) {
      if (typeof p === "symbol") throw new Error("cannot index idb store with a symbol");

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
  }) as IdbStore<T>;
};

// stuff like this is necessary when you *need* to have gets return persisted values as well as newly set ones

/** if the store is or is not yet connected to IDB */
export const isInited = (store: IdbStore<unknown>) => !!store[symDb];
/** waits for the store to connect to IDB, then runs the callback (if connected, synchronously runs the callback now) */
export const whenInited = (store: IdbStore<unknown>, cb: () => void) => store[symWait](cb) as void;
/** returns a promise that resolves when the store is connected to IDB (if connected, resolves instantly) */
export const waitInit = (store: IdbStore<unknown>) => new Promise<void>((res) => whenInited(store, res));

/** sets default values for the store. these only apply once the store connects to IDB to prevent overwriting persist */
export const defaults = <T = any>(store: IdbStore<T>, fallbacks: Record<string, T>) =>
  whenInited(store, () =>
    batch(() => {
      for (const k in fallbacks) if (!(k in store)) store[k] = fallbacks[k];
    }),
  );

/** gets a signal containing the whole store as an object */
export const signalOf = <T = any>(store: IdbStore<T>): (() => Record<string, T>) => store[symSig];
