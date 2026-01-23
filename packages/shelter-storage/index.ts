import { proxy, snapshot, subscribe } from "valtio/vanilla";
import { ensureDbReady, entries, setAllFromObject } from "./idb.js";
import { batch, createSignal, onCleanup } from "solid-js";

const getValtioSymbol = Symbol();
const isShelterProxySymbol = Symbol();
const flushSymbol = Symbol();
const isInitedSymbol = Symbol();
const initPromiseSymbol = Symbol();

// taken from valtio source code and tweaked
const shouldProxy = (x) =>
  typeof x === "object" &&
  x !== null &&
  (Array.isArray(x) || !(Symbol.iterator in x)) &&
  !(x instanceof WeakMap) &&
  !(x instanceof WeakSet) &&
  !(x instanceof Error) &&
  !(x instanceof Number) &&
  !(x instanceof Date) &&
  !(x instanceof String) &&
  !(x instanceof RegExp) &&
  !(x instanceof ArrayBuffer) &&
  !(x instanceof Promise);

// valtio stores are almost perfect but they are not solid-reactive, so we wrap them to add that functionality.
const deepWrapValtioStorage = <T extends object>(
  unwrapped: T,
  flush: () => void,
  initState: [Promise<void>, boolean],
) =>
  new Proxy(unwrapped, {
    get(_target, property, _receiver) {
      if (property === isShelterProxySymbol) return true;
      if (property === getValtioSymbol) return unwrapped;
      if (property === flushSymbol) return flush;
      if (property === isInitedSymbol) return initState[1];
      if (property === initPromiseSymbol) return initState[0];

      const generateValue = () => {
        const value = unwrapped[property];

        return shouldProxy(value) ? deepWrapValtioStorage(value, flush, initState) : value;
      };

      const [sig, setSig] = createSignal(generateValue());

      const unsub = subscribe(unwrapped, () => setSig(() => generateValue()));

      onCleanup(unsub);

      return sig();
    },

    set(target, property, value, receiver) {
      // deeply unwrap shelter storages
      const unwrapStoragesDeep = (value: unknown) => {
        if (typeof value !== "object") return;

        for (const k in value) {
          if (isShelterStorage(value[k])) value[k] = underlyingValtioProxy(value[k]);

          unwrapStoragesDeep(value[k]);
        }
      };

      if (isShelterStorage(value)) value = underlyingValtioProxy(value);
      unwrapStoragesDeep(value);

      return Reflect.set(target, property, value, receiver);
    },
  });

export const isShelterStorage = (shelterProxy: object) => !!shelterProxy?.[isShelterProxySymbol];

export function underlyingValtioProxy<T extends object>(shelterProxy: T): T {
  if (!isShelterStorage(shelterProxy))
    throw new Error("Cannot get underlying valtio proxy from an object that is not a shelter storage proxy");

  return shelterProxy[getValtioSymbol] as T;
}

export function flush(shelterProxy: object) {
  if (!isShelterStorage(shelterProxy)) throw new Error("Cannot flush an object that is not a shelter storage proxy");

  return shelterProxy[flushSymbol]();
}

export function createShelterStorage(backingName: string) {
  // create backing valtio store
  const store = proxy();

  // connect database
  let initRes: () => void;
  const initState: [Promise<void>, boolean] = [new Promise<void>((res) => (initRes = res)), false];

  const flush = () =>
    initState[0].then(() => {
      const snap = snapshot(store);

      return setAllFromObject(backingName, snap);
    });

  let cleanupSubscription = () => {};
  let subscriptionCleanedUp = false;
  // set state from db
  ensureDbReady(backingName)
    .then(() => entries(backingName))
    .then((entries) => {
      for (const [k, v] of entries as [string, unknown][]) {
        if (!(k in store)) store[k] = v;
      }

      initRes();
      initState[1] = true;

      // create subscription
      if (!subscriptionCleanedUp) cleanupSubscription = subscribe(store, flush);
    });

  onCleanup(() => cleanupSubscription());

  return deepWrapValtioStorage(store, flush, initState);
}

export const createUnbackedStorage = () =>
  deepWrapValtioStorage(
    proxy(),
    () => {
      throw new Error("cannot flush an unbacked storage");
    },
    [Promise.resolve(), true],
  );

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

// stuff like this is necessary when you *need* to have gets return persisted values as well as newly set ones

/** if the store is or is not yet connected to IDB */
export const isInited = (store: unknown) => !!store[isInitedSymbol];
/** returns a promise that resolves when the store is connected to IDB (if connected, resolves instantly) */
export const waitInit = (store: unknown) => store[initPromiseSymbol];

/** sets default values for the store. these only apply once the store connects to IDB to prevent overwriting persist */
export const defaults = <T extends object = any>(store: T, fallbacks: T) =>
  waitInit(store).then(() =>
    batch(() => {
      for (const k in fallbacks) if (!(k in store)) store[k] = fallbacks[k];
    }),
  );

export { queueDatabaseDeletion } from "./idb.js";
