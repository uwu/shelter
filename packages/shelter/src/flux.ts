import { Dispatcher, FluxStore } from "./types";
import exfiltrate from "./exfiltrate";

declare global {
  interface Object {
    _dispatcher?: Dispatcher;
  }
}

let dispatcher: Dispatcher | Promise<Dispatcher>;

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

type Intercept = (payload: any) => void | [any, boolean];

let intercepts: Intercept[] = [];
let interceptInjected = false;

async function injectIntercept() {
  if (interceptInjected) return;
  interceptInjected = true;

  const FluxDispatcher = await getDispatcher();

  FluxDispatcher._interceptors ??= [];

  const cb = (payload) => {
    for (const intercept of intercepts) {
      const res = intercept(payload);
      if (res) {
        if (res[1]) return true;
        payload = res[0];
      }
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
