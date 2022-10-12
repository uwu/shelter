import { webpackChunk } from "@cumjar/websmack";

declare global {
  interface Object {
    _dispatcher: undefined;
  }
}

let dispatcher;
let dispatcherSymbol = Symbol("SHELTER_DISPATCHER_CONTAINER");

export async function getDispatcher() {
  // TODO: Actually type the dispatcher
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
          this[dispatcherSymbol] = value
          
          if (dispatcher) {
            dispatcher = value;
            res(dispatcher);
            delete Object.prototype._dispatcher;
          }
        },
        get() {
          return this[dispatcherSymbol];
        },
      });
    });

  return dispatcher;
}

export let FluxStores = {};

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
