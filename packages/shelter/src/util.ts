import { batch, createSignal, onCleanup } from "solid-js";
import { getDispatcher } from "./flux";
import { Fiber, FluxStore } from "./types";

declare global {
  interface Element {
    __reactFiber$: Fiber;
  }
}

export const getFiber = (n: Element): Fiber => n.__reactFiber$;

export function reactFiberWalker(node: Fiber, prop: string | symbol, goUp = false): undefined | null | Fiber {
  if (!node) return;
  if (node.pendingProps?.[prop] !== undefined) return node;

  return reactFiberWalker(goUp ? node.return : node.child, prop, goUp) ?? reactFiberWalker(node.sibling, prop, goUp);
}

export const awaitDispatch = (type: string) =>
  new Promise<any>(async (res) => {
    const dispatcher = await getDispatcher();
    const cb = (d) => {
      res(d);
      dispatcher.unsubscribe(type, cb);
    };
    dispatcher.subscribe(type, cb);
  });

export function log(text: any, func: "log" | "warn" | "error" = "log") {
  console[func](
    "%cshelter%c",
    "background: linear-gradient(180deg, #2A3B4B 0%, #2BFAAC 343.17%); color: white; padding: 6px",
    "",
    text
  );
}

// listens for dispatches with the given type and returns a signal with the data of the most recent dispatch
// of that type. signal is undefined between listener create and first dispatch.
export function createListener(type: string): () => any {
  const [subData, setSubData] = createSignal();

  let cancel = false,
    dispatcher;
  getDispatcher().then((d) => {
    if (cancel) return;
    dispatcher = d;
    dispatcher.subscribe(type, setSubData);
  });

  onCleanup(() => {
    cancel = true;
    dispatcher?.unsubscribe(type, setSubData);
  });

  return subData;
}

// gets the data from a flux store reactively
export function createSubscription<TState, TStoreData = any>(
  store: FluxStore<TStoreData>,
  getStateFromStore: (store: FluxStore<TStoreData>) => TState
): () => TState {
  const [data, setData] = createSignal(getStateFromStore(store));

  const cb = () => setData(() => getStateFromStore(store));
  store.addChangeListener(cb);
  onCleanup(() => store.removeChangeListener(cb));

  return data;
}

export const storeAssign = <T>(store: T, toApply: T) => batch(() => Object.assign(store, toApply));
