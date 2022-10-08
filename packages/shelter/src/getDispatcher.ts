import { webpackChunk } from "@cumjar/websmack";

declare global {
  interface Object {
    _dispatcher: undefined;
  }
}

let dispatcher;
export default async function getDispatcher() { // TODO: Actually type the dispatcher
  if (dispatcher) return dispatcher;

  try {
    // @ts-expect-error We have a fallback, it's okay
    dispatcher = Object.values(
      webpackChunk("webpackChunkdiscord_app")[0]
    ).find(
      // @ts-expect-error We have a fallback
      (x) => x?.exports?.default?._dispatcher
    ).exports.default._dispatcher;
  } catch {
    // I know what you're thinking.
    // You're thinking "What the fuck? An error not being handled?!"
    // Read below!!!
  }

  // Promises bubble up, this is fine.
  if (!dispatcher) dispatcher = new Promise((res) => {
    // Are you happy now?
    Object.defineProperty(Object.prototype, "_dispatcher", {
      set(value) {
        dispatcher = value;
        if (!dispatcher) {
          res(dispatcher);
          delete Object.prototype._dispatcher;
        }
      },
      get() {
        return dispatcher;
      },
    });
  });

  return dispatcher;
}
