import { proxy, snapshot, subscribe } from "valtio/vanilla";
import { persist } from "valtio-persist";
import { IndexedDBStrategy } from "valtio-persist/indexed-db";
import { createSignal, onCleanup } from "solid-js";

const getValtioSymbol = Symbol();
const isShelterProxySymbol = Symbol();
const flushSymbol = Symbol();

// valtio stores are almost perfect but they are not solid-reactive, so we wrap them to add that functionality.
const deepWrapValtioStorage = <T extends object>(unwrapped: T, flush: () => void) =>
  new Proxy(unwrapped, {
    get(_target, property, _receiver) {
      if (property === isShelterProxySymbol) return true;
      if (property === getValtioSymbol) return unwrapped;
      if (property === flushSymbol) return flush;

      const generateValue = () => {
        const value = unwrapped[property];

        return typeof value === "object" ? deepWrapValtioStorage(value, flush) : value;
      };

      const [sig, setSig] = createSignal(generateValue());

      const unsub = subscribe(unwrapped, () => setSig(() => generateValue()));

      onCleanup(unsub);

      return sig();
    },
  });

export const isShelterStorage = (shelterProxy: object) => !!shelterProxy[isShelterProxySymbol];

export function underlyingValtioProxy<T extends object>(shelterProxy: T): T {
  if (!isShelterStorage(shelterProxy))
    throw new Error("Cannot get underlying valtio proxy from an object that is not a shelter storage proxy");

  return shelterProxy[getValtioSymbol] as T;
}

export function flush(shelterProxy: object) {
  if (!isShelterStorage(shelterProxy)) throw new Error("Cannot flush an object that is not a shelter storage proxy");

  return shelterProxy[flushSymbol]();
}

export async function createShelterStorage(backingName: string) {
  // create backing valtio store
  const { store, persist: flush } = await persist({}, backingName, {
    storageStrategy: IndexedDBStrategy,
  });

  return deepWrapValtioStorage(store, flush);
}

export const createUnbackedStorage = () =>
  deepWrapValtioStorage(proxy(), () => {
    throw new Error("cannot flush an unbacked storage");
  });

export function getSnapshotSignal<T extends object>(shelterProxy: T) {
  if (!isShelterStorage(shelterProxy))
    throw new Error("Cannot get a snapshot signal of an object that is not a shelter storage proxy");

  const underlying = underlyingValtioProxy(shelterProxy);

  const generateSnapshot = () => snapshot(underlying);

  const [sig, setSig] = createSignal(generateSnapshot());

  const unsub = subscribe(underlying, () => setSig(() => generateSnapshot()));

  onCleanup(unsub);

  return sig;
}
