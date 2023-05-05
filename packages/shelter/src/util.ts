import { batch, createSignal, onCleanup } from "solid-js";
import { getDispatcher, stores } from "./flux";
import { Fiber, FluxStore } from "./types";

declare global {
  interface Element {
    [k: `__reactFiber$${string}`]: Fiber;
  }
}

export const getFiber = (n: Element): Fiber => n[Object.keys(n).find((key) => key.startsWith("__reactFiber$"))];

export function reactFiberWalker(
  node: Fiber,
  filter: string | symbol | ((node: Fiber) => boolean),
  goUp = false,
  ignoreStringType = false,
  recursionLimit = 100,
): undefined | null | Fiber {
  if (recursionLimit === 0) return;

  if (typeof filter !== "function") {
    const prop = filter;
    filter = (n) => n?.pendingProps?.[prop] !== undefined;
  }

  if (!node) return;
  if (filter(node) && (ignoreStringType ? typeof node.type !== "string" : true)) return node;

  return (
    reactFiberWalker(goUp ? node.return : node.child, filter, goUp, ignoreStringType, recursionLimit - 1) ??
    reactFiberWalker(node.sibling, filter, goUp, ignoreStringType, recursionLimit - 1)
  );
}

export const awaitDispatch = (type: string) =>
  new Promise<any>(async (res) => {
    const dispatcher = await getDispatcher();
    const cb = (d) => {
      res(d);
      dispatcher.unsubscribe(type, cb);
    };
    dispatcher.subscribe(type, cb);
  });

export function log(text: any, func?: "log" | "warn" | "error"): void;
export function log(text: any[], func?: "log" | "warn" | "error"): void;
export function log(text: any[], func: "log" | "warn" | "error" = "log") {
  console[func](
    "%cshelter%c",
    "background: linear-gradient(180deg, #2A3B4B 0%, #2BFAAC 343.17%); color: white; padding: 6px",
    "",
    ...(Array.isArray(text) ? text : [text]),
  );
}

// listens for dispatches with the given type and returns a signal with the data of the most recent dispatch
// of that type. signal is undefined between listener create and first dispatch.
export function createListener(type: string): () => any {
  const [subData, setSubData] = createSignal();

  let cancel = false,
    dispatcher;
  getDispatcher().then((d) => {
    if (cancel) return;
    dispatcher = d;
    dispatcher.subscribe(type, setSubData);
  });

  onCleanup(() => {
    cancel = true;
    dispatcher?.unsubscribe(type, setSubData);
  });

  return subData;
}

// gets the data from a flux store reactively
export function createSubscription<TState, TStoreData = unknown>(
  store: FluxStore<TStoreData>,
  getStateFromStore: (store: FluxStore<TStoreData>) => TState,
): () => TState {
  const [data, setData] = createSignal(getStateFromStore(store));

  const cb = () => setData(() => getStateFromStore(store));
  store.addChangeListener(cb);
  onCleanup(() => store.removeChangeListener(cb));

  return data;
}


const storeInitPromises = new WeakMap<FluxStore, Promise<void>>();

// awaits until the _isInitialized property of a store is true by overwritting it's setter
function awaitStoreInit(store: FluxStore): Promise<void> {
  return storeInitPromises[store] ?? (storeInitPromises[store] = new Promise<void>(resolve => {
    if (store._isInitialized) resolve();

    let actualIsInitialized = false;

    Object.defineProperty("_isInitialized", store, {
      get() {
        return actualIsInitialized;
      },
      set(value) {
        actualIsInitialized = value;
        if (value === true) {
          resolve();
        }
      }
    })
  }))
}

type storeCb = (store: FluxStore | FluxStore[]) => void
const storeCallbacks: {[storeName: string]: storeCb[]} = {}

function addStoreCallback(name: string, cb: storeCb) {
  if (!storeCallbacks[name]) {
    storeCallbacks[name] = [cb]
  } else {
    storeCallbacks[name].push(cb)
  }
}

export function onStoreFound(store: FluxStore | FluxStore[]) {
  const name = store?.getName() ?? store?.[0].getName();
  const callbacks = storeCallbacks[name];
  callbacks && callbacks.forEach(c => c(store));
  delete storeCallbacks[name];
}

export function awaitStore(name: string, awaitInit?: boolean, flat?: true): Promise<FluxStore>;
export function awaitStore(name: string, awaitInit: boolean | undefined, flat: false): Promise<FluxStore[]>;
export async function awaitStore(name: string, awaitInit = true, flat = true): Promise<FluxStore | FluxStore[]> {
  let store = stores[name] ?? await new Promise(resolve => addStoreCallback(name, resolve));
  if (flat && store?.[0]) {
    store = store[0];
  }
  if (awaitInit) {
    if (!flat && Array.isArray(store)) {
      await Promise.all(store.map(s => awaitStoreInit(s)));
    } else {
      await awaitStoreInit(store);
    }
  }
  return store;
}

export const storeAssign = <T>(store: T, toApply: T) => batch(() => Object.assign(store, toApply));

export const sleep = (ms = 0) => new Promise((r) => setTimeout(r, ms));
