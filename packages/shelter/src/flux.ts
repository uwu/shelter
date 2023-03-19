import { Dispatcher, FluxStore } from "./types";
import exfiltrate from "./exfiltrate";

declare global {
  interface Object {
    _dispatcher?: Dispatcher;
  }
}

let dispatcher: Promise<Dispatcher>;

export async function getDispatcher() {
  if (dispatcher) return dispatcher;

  // Promises bubble up, this is fine.
  return (dispatcher = exfiltrate("_dispatcher").then((fluxstore) => fluxstore._dispatcher));
}

export const stores: Record<string, FluxStore | FluxStore[]> = {};

// noinspection JSIgnoredPromiseFromCall
exfiltrate("_dispatchToken", (store) => {
  const name = store.getName();
  if (!stores[name]) stores[name] = store;
  else {
    if (Array.isArray(stores[name])) stores[name].push(store);
    else stores[name] = [stores[name], store];
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

    for (const intercept of intercepts) {
      const res = intercept(payload);

      // legacy return type handler: [modified, shouldDrop]
      if (Array.isArray(res)) {
        if (res[1]) {
          payload[blockedSym] = 1;
          return true;
        }
        apply(res[0]);
      }
      // current API: nullish -> nothing, falsy -> block, object -> modify
      // NON-strict eq intentional here
      else if (res == null) continue;
      else if (!res) {
        payload[blockedSym] = 1;
        return true; // TODO: make sure other interceptors still get called (!!!!!!)
      } else if (typeof res === "object") apply(res);
    }
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
