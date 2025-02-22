import { batch, createSignal, Signal, untrack } from "solid-js";
import { IDBPDatabase, openDB } from "idb";
import { log } from "./util";

// can't use a solid store as i could do with bespoke logic for idb
// so heres a custom proxy impl -- sink

// idb cannot directly store solid mutables so this clones them
function cloneRec(node: unknown, seenNodes: object[] = []) {
  switch (typeof node) {
    case "function":
    case "symbol":
      //throw new Error
      log(`can't store a ${typeof node} in a shelter storage!`, "error");
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

export interface ShelterStore<T> {
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
  // for signals that were created by a get call because their values were not set yet
  const pendingSignals: Record<string, Signal<any>> = {};
  const signals: Record<string, Signal<any>> = {};
  let db: IDBPDatabase<any>;
  // these are only relevant before the database is connected, to allow premature write operations
  let modifiedKeys = new Set<string>();
  let deletedKeys = new Set<string>();

  // queues callbacks for when the db loads
  const waitQueue: (() => void)[] = [];
  const waitInit = (cb: () => void) => (db ? cb() : waitQueue.push(cb));

  const [mainSignal, setMainSignal] = createSignal({});
  const updateMainSignal = () => {
    const o = {};
    for (const k in signals) o[k] = untrack(() => signals[k][0]());
    setMainSignal(o);
  };

  getDb(name).then(async (d) => {
    const keys = await d.getAllKeys(name);
    await Promise.all(keys.map(async (k) => [k, await d.get(name, k)])).then((vals) => {
      // if a signal exists but wasn't modified (get), set it from db
      // if a signal exists and was modified, (set) leave it be
      // if a signal does not exist and was not deleted, create it from db
      for (const [k, v] of vals) {
        if (k in pendingSignals) {
          signals[k] = pendingSignals[k];
          delete pendingSignals[k];
        }
        if (k in signals) {
          if (!modifiedKeys.has(k)) signals[k][1](v);
        } else if (!deletedKeys.has(k)) signals[k] = createSignal(v);
      }

      updateMainSignal();
    });

    db = d;

    waitQueue.forEach((cb) => cb());
  });

  return new Proxy(<ShelterStore<T>>{}, {
    get(_, p) {
      // internal things
      if (p === symWait) return waitInit;
      if (p === symDb) return db;
      if (p === symSig) return mainSignal;

      if (typeof p === "symbol") throw new Error("cannot index db store with a symbol");

      if (p in signals) return signals[p][0]();
      return (pendingSignals[p] ??= createSignal())[0]();
    },

    set(_, p, v) {
      if (typeof p === "symbol") throw new Error("cannot index db store with a symbol");

      modifiedKeys.add(p);
      //deletedKeys.delete(p); // we're overwriting it anyway so if its creation is suppressed is irrelevant
      if (p in pendingSignals) {
        signals[p] = pendingSignals[p];
        delete pendingSignals[p];
      }
      const [, setSig] = (signals[p] ??= createSignal());
      setSig(() => v);
      updateMainSignal();

      waitInit(() => db.put(name, cloneRec(v), p));

      return true;
    },

    deleteProperty(_, p) {
      if (typeof p === "symbol") throw new Error("cannot index db store with a symbol");

      //modifiedKeys.delete(p); // doesn't do anything
      deletedKeys.add(p);
      delete signals[p];
      delete pendingSignals[p];
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
export const whenInited = (store: ShelterStore<unknown>, cb: () => void) => store[symWait](cb) as void;
/** returns a promise that resolves when the store is connected to IDB (if connected, resolves instantly) */
export const waitInit = (store: ShelterStore<unknown>) => new Promise<void>((res) => whenInited(store, res));

/** sets default values for the store. these only apply once the store connects to IDB to prevent overwriting persist */
export const defaults = <T = any>(store: ShelterStore<T>, fallbacks: Record<string, T>) =>
  whenInited(store, () =>
    batch(() => {
      for (const k in fallbacks) if (!(k in store)) store[k] = fallbacks[k];
    }),
  );

/** gets a signal containing the whole store as an object */
export const signalOf = <T = any>(store: ShelterStore<T>): (() => Record<string, T>) => store[symSig];

/** wraps a solid mutable to provide a global signal */
export const solidMutWithSignal = <T extends object = any>(store: T) => {
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
  ] as const;
};
