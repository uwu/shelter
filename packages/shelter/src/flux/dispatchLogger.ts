import { blockedSym, getDispatcher, modifiedSym } from ".";
import { log } from "../util";
import { dbStore, defaults } from "../storage";

defaults(dbStore, { logDispatch: false });

export const initDispatchLogger = async () => {
  const dispatcher = await getDispatcher();
  let backing = dispatcher._dispatch;

  // the patcher kept getting overwritten, so we're doing it this way!
  Object.defineProperty(Object.getPrototypeOf(dispatcher), "_dispatch", {
    // unpatching
    configurable: true,
    // this doesn't appear to ever get hit but i'll handle the case anyway
    set: (val) => (backing = val),
    get: () =>
      function (...args) {
        if (!dbStore.logDispatch) return backing.apply(this, args);

        let origDispatch;
        try {
          origDispatch = structuredClone(args[0]);
        } catch {
          origDispatch = { ...args[0] };
        }

        const ret = backing.apply(this, args);

        // interceptors modify the obj in place
        if (args[0][blockedSym]) log(["DISPATCH BLOCKED", args[0]], "warn");
        else if (args[0][modifiedSym]) log(["DISPATCH MODIFIED FROM", origDispatch, "TO", args[0]], "warn");
        else log(args[0]);

        return ret;
      },
  });

  return () =>
    Object.defineProperty(Object.getPrototypeOf(dispatcher), "_dispatch", {
      configurable: true,
      writable: true,
      value: backing,
    });
};
