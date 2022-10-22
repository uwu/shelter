import { webpackChunk } from "@cumjar/websmack";
import { Dispatcher, FluxStore } from "./types";
import { instead } from "spitroast";

declare global {
  interface Object {
    _dispatcher?: Dispatcher;
  }
}

let dispatcher: Dispatcher | Promise<Dispatcher>;

export async function getDispatcher() {
  if (dispatcher) return dispatcher;

  try {
    dispatcher = Object.values(webpackChunk("webpackChunkdiscord_app")[0]).find(
      // @ts-expect-error We have a fallback, it's okay
      (x) => x?.exports?.default?._dispatcher
      // @ts-expect-error We have a fallback
    ).exports.default._dispatcher;
  } catch {
    // I know what you're thinking.
    // You're thinking "What the fuck? An error not being handled?!"
    // Read below!!!
  }

  // Promises bubble up, this is fine.
  if (!dispatcher)
    dispatcher = new Promise((res) => {
      // Are you happy now?
      Object.defineProperty(Object.prototype, "_dispatcher", {
        set(value) {
          if (dispatcher) {
            dispatcher = Object.defineProperty(this, "_dispatcher", {
              value,
            })._dispatcher;
            res(dispatcher);
            delete Object.prototype._dispatcher;
          }
        },
        configurable: true,
      });
    });

  return dispatcher;
}

export const stores: Record<string, FluxStore | FluxStore[]> = {};

const realDispatchTokenKey = Symbol("shelter _dispatchToken");
Object.defineProperty(Object.prototype, "_dispatchToken", {
  set(value) {
    this[realDispatchTokenKey] = value;
    const name = this.getName();
    if (!stores[name]) stores[name] = this;
    else {
      if (Array.isArray(stores[name])) stores[name].push(this);
      else stores[name] = [stores[name], this];
    }
  },
  get() {
    return this[realDispatchTokenKey];
  },
});

type Intercept = (payload: any) => void | [any, boolean];

let intercepts: Intercept[] = [];
let interceptInjected = false;

async function injectIntercept() {
  if (interceptInjected) return;
  interceptInjected = true;

  const FluxDispatcher = await getDispatcher();

  FluxDispatcher._interceptor ??= () => {}; // patcher needs smth to patch!

  instead("_interceptor", FluxDispatcher, ([payload], orig) => {
    for (const intercept of intercepts) {
      const res = intercept(payload);
      if (res) {
        if (res[1]) return true;
        payload = res[0];
      }
    }

    return orig(payload);
  });
}

export function intercept(cb: Intercept) {
  // noinspection JSIgnoredPromiseFromCall
  injectIntercept();

  intercepts.push(cb);

  return () => {
    intercepts = intercepts.filter((i) => i !== cb);
  };
}
