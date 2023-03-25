import { idbStore } from "shelter-storage";
import { createSignal } from "solid-js";

export * from "shelter-storage";

export const dbStore = idbStore("dbstore");
export const _dbStore = dbStore;

/** wraps a solid mutable to provide a global signal */
export const solidMutWithSignal = <T extends object = any>(store: T) => {
  const [sig, setSig] = createSignal<T>();
  const update = () => setSig(() => ({ ...store }));
  return [
    new Proxy(store, {
      set(t, p, v, r) {
        const success = Reflect.set(t, p, v, r);
        if (success) update();
        return success;
      },
      deleteProperty(t, p) {
        const success = Reflect.deleteProperty(t, p);
        if (success) update();
        return success;
      },
    }),
    sig,
  ] as const;
};
