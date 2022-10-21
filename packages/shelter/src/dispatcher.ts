import { webpackChunk } from "@cumjar/websmack";
import { Dispatcher, FluxStore } from "./types";

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

export let FluxStores: Record<string, FluxStore | FluxStore[]> = {};

const realDispatchTokenKey = Symbol("shelter _dispatchToken");
Object.defineProperty(Object.prototype, "_dispatchToken", {
  set(value) {
    this[realDispatchTokenKey] = value;
    const name = this.getName();
    if (!FluxStores[name]) FluxStores[name] = this;
    else {
      if (Array.isArray(FluxStores[name])) FluxStores[name].push(this);
      else FluxStores[name] = [FluxStores[name], this];
    }
  },
  get() {
    return this[realDispatchTokenKey];
  },
});
