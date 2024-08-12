import { batch, untrack } from "solid-js";
import { makeDeepProxy } from "./deep";
import { DbStore, entries, open, remove, set as dbSet } from "./idb";
import { delKey, getNode, getValue, has, makeRoot, set } from "./signalTree";

const symWait = Symbol();
const symReady = Symbol();
const symDb = Symbol();
const symSig = Symbol();

export interface IdbStore<T> {
  [_: string]: T;

  [symWait]: (cb: () => void) => void;
  [symReady]: boolean;
  [symDb]: DbStore; //IDBPDatabase<any>;
  [symSig]: () => Record<string, T>;
}

const getDb = (store: string) => open("shelter", store);

export const idbStore = <T = any>(name: string) => {
  const tree = makeRoot();
  const store = getDb(name);
  let inited = false;
  let modifiedKeys = new Set<string>();

  // queues callbacks for when the db loads
  const waitQueue: (() => void)[] = [];
  const waitInit = (cb: () => void) => void (inited ? cb() : waitQueue.push(cb));

  // get all entries of db to setup initial state
  entries(store).then((e) => {
    // if a node exists but wasn't modified (get), set it from db
    // if a node exists and was modified, (set, delete) leave it be
    // if a node does not exist, create it from db
    for (const [_k, v] of e) {
      // idbvalidkey is more permissive than keyof {}
      const k = _k as string;

      if (k in tree.children) {
        if (!modifiedKeys.has(k)) set(tree, [k], v);
      } else {
        set(tree, [k], v);
      }
    }

    inited = true;
    waitQueue.forEach((cb) => cb());
    waitQueue.length = 0;
  });

  return makeDeepProxy({
    get(path, p) {
      // internal things
      if (p === symWait) return waitInit;
      if (p === symReady) return inited;
      if (p === symDb) return store;
      if (p === symSig) return () => tree.sig[0]();

      // etc
      //if (typeof p === "symbol") throw new Error("cannot index idb store with a symbol");

      //return getNode(tree, [...(path as string[]), p])?.sig[0]();
      return getValue(tree, [...(path as string[]), p]);
    },

    set(path, p, v) {
      if (typeof p === "symbol") throw new Error("cannot index idb store with a symbol");

      const resolvedPath = [...(path as string[]), p];
      const topLevelPath = resolvedPath[0];
      modifiedKeys.add(topLevelPath);

      set(tree, resolvedPath, v);

      waitInit(async () => {
        const val = untrack(getNode(tree, [topLevelPath]).sig[0]);
        await dbSet(topLevelPath, val, store);
      });

      return true;
    },

    deleteProperty(path, p) {
      if (typeof p === "symbol") throw new Error("cannot index idb store with a symbol");

      const resolvedPath = [...(path as string[]), p];
      const topLevelPath = resolvedPath[0];
      modifiedKeys.add(topLevelPath);

      delKey(tree, resolvedPath);
      waitInit(async () => {
        if (path.length === 0) await remove(p, store);
        else {
          const val = untrack(getNode(tree, [topLevelPath]).sig[0]);
          await dbSet(topLevelPath, val, store);
        }
      });

      return true;
    },

    has: (path, p) => has(tree, [...path, p] as string[]),

    ownKeys(path) {
      const node = getNode(tree, path as string[]);
      return Object.keys(
        node.type === "object" || node.type === "root" || node.type === "array" ? node.children : untrack(node.sig[0]),
      );
    },

    // without this, properties are not enumerable! (object.keys wouldn't work)
    getOwnPropertyDescriptor: (path, p) => ({
      value: null, // this should never be directly accessed, `get` should be used.
      enumerable: true,
      configurable: true,
      writable: true,
    }),
  }) as IdbStore<T>;
};

// stuff like this is necessary when you *need* to have gets return persisted values as well as newly set ones

/** if the store is or is not yet connected to IDB */
export const isInited = (store: IdbStore<unknown>) => store[symReady];
/** waits for the store to connect to IDB, then runs the callback (if connected, synchronously runs the callback now) */
export const whenInited = (store: IdbStore<unknown>, cb: () => void) => store[symWait](cb);
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
