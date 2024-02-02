import { Dispatcher, FluxStore } from "../types";
import exfiltrate from "../exfiltrate";

declare global {
  interface Object {
    _dispatcher?: Dispatcher;
  }
}

let dispatcher: Promise<Dispatcher>;

export async function getDispatcher() {
  if (dispatcher) return dispatcher;

  // Promises bubble up, this is fine.
  return (dispatcher = exfiltrate("_dispatcher").then((fluxstore) => fluxstore._dispatcher as Dispatcher));
}

export const stores: Record<string, FluxStore | FluxStore[]> = {};

// noinspection JSIgnoredPromiseFromCall
exfiltrate("_dispatchToken", (store: FluxStore) => {
  const name = store.getName();
  if (!stores[name]) {
    stores[name] = store;
    onStoreFound(store);
  } else {
    if (Array.isArray(stores[name])) (stores[name] as FluxStore[]).push(store);
    else stores[name] = [stores[name] as FluxStore, store];
  }

  // abusing the "filter" to just steal all the stores
  // but why not?
  return false;
});

// I would make this pass `any` but IDE support is always nice!
type Intercept = (payload: Record<string, any> & { type: string }) => any;

let intercepts: Intercept[] = [];
let interceptInjected = false;

export const blockedSym = Symbol();
export const modifiedSym = Symbol();

async function injectIntercept() {
  if (interceptInjected) return;
  interceptInjected = true;

  const FluxDispatcher = await getDispatcher();

  FluxDispatcher._interceptors ??= [];

  const cb = (payload) => {
    const apply = (obj) => {
      for (const k in Reflect.ownKeys(payload)) delete payload[k];

      Object.assign(payload, obj);
      payload[modifiedSym] = 1;
    };

    let blocked = false;

    for (const intercept of intercepts) {
      const res = intercept(payload);

      // legacy return type handler: [modified, shouldDrop]
      if (Array.isArray(res)) {
        if (res[1]) {
          payload[blockedSym] = 1;
          blocked = true;
        }
        apply(res[0]);
      }
      // current API: nullish -> nothing, falsy -> block, object -> modify
      // NON-strict eq intentional here
      else if (res == null) continue;
      else if (!res) {
        payload[blockedSym] = 1;
        blocked = true;
      } else if (typeof res === "object") apply(res);
    }

    return blocked;
  };

  FluxDispatcher._interceptors.splice(0, 0, cb);

  return () => (FluxDispatcher._interceptors = FluxDispatcher._interceptors?.filter((v) => v !== cb));
}

export function intercept(cb: Intercept) {
  // noinspection JSIgnoredPromiseFromCall
  injectIntercept();

  intercepts.push(cb);

  return () => {
    intercepts = intercepts.filter((i) => i !== cb);
  };
}

export const storesFlat = new Proxy<Record<string, FluxStore>>(stores as any, {
  get: (_, name: string) => stores[name]?.[0] ?? stores[name],
  set() {
    throw new Error("do not try to mutate flatStores");
  },
  deleteProperty() {
    throw new Error("do not try to mutate flatStores");
  },
  defineProperty() {
    throw new Error("do not try to mutate flatStores");
  },
  setPrototypeOf() {
    throw new Error("do not try to mutate flatStores");
  },
});

const storeInitPromises = new WeakMap<FluxStore, Promise<void>>();

// awaits until the _isInitialized property of a store is true by overwritting it's setter
function awaitStoreInit(store: FluxStore): Promise<void> {
  if (store._isInitialized) return;

  if (storeInitPromises.has(store)) {
    return storeInitPromises.get(store);
  }
  const initPromise = new Promise<void>((resolve) => {
    let actualIsInitialized = false;

    Object.defineProperty(store, "_isInitialized", {
      get() {
        return actualIsInitialized;
      },
      set(value) {
        actualIsInitialized = value;
        if (value === true) {
          resolve();
          storeInitPromises.delete(store);
        }
      },
    });
  });
  storeInitPromises.set(store, initPromise);
  return initPromise;
}

const storeCallbacks: Record<string, ((store: FluxStore) => void)[]> = {};

function onStoreFound(store: FluxStore) {
  const name = store?.getName();
  storeCallbacks[name]?.forEach((c) => c(store));
  delete storeCallbacks[name];
}

async function getStoreOnCallback(name: string) {
  return new Promise<FluxStore>((resolve) => {
    if (!storeCallbacks[name]) {
      storeCallbacks[name] = [resolve];
    } else {
      storeCallbacks[name].push(resolve);
    }
  });
}

export async function awaitStore(name: string, awaitInit = true): Promise<FluxStore> {
  const store: FluxStore = stores[name]?.[0] ?? stores[name] ?? (await getStoreOnCallback(name));
  if (awaitInit) await awaitStoreInit(store);
  return store;
}

export * from "./dispatchLogger";
