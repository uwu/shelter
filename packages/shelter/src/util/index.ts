import { batch, createSignal, onCleanup } from "solid-js";
import { getDispatcher, intercept } from "../flux";
import { Fiber, FluxStore, FiberOwner } from "../types";

declare global {
  interface Element {
    [k: `__reactFiber$${string}`]: Fiber;
  }
}

// the randomKey that React adds after __reactFiber$ is the same for all elements created by the React instance
// so it's sensible to cache it
// see https://github.com/facebook/react/blob/2a9f4c04e54294b668e0a2ae11c1930c2e57b248/packages/react-dom-bindings/src/client/ReactDOMComponentTree.js#L39
let fiberKey: string;
export const getFiber = (n: Element): Fiber => {
  if (fiberKey && n[fiberKey]) return n[fiberKey];
  return n[(fiberKey = Object.keys(n).find((key) => key.startsWith("__reactFiber$")) ?? fiberKey)];
};

export const getFiberOwner = (n: Element | Fiber): undefined | null | FiberOwner => {
  const filter = ({ stateNode }: Fiber) => stateNode && !(stateNode instanceof Element);
  return reactFiberWalker(n instanceof Element ? getFiber(n) : n, filter, true)?.stateNode as
    | undefined
    | null
    | FiberOwner;
};

export function reactFiberWalker(
  node: Fiber,
  filter: string | symbol | ((node: Fiber) => boolean),
  goUp = false,
  ignoreStringType = false,
  recursionLimit = 100,
): undefined | null | Fiber {
  if (recursionLimit === 0) return;

  if (typeof filter !== "function") {
    const prop = filter;
    filter = (n) => n?.pendingProps?.[prop] !== undefined;
  }

  if (!node) return;
  if (filter(node) && (ignoreStringType ? typeof node.type !== "string" : true)) return node;

  return (
    reactFiberWalker(goUp ? node.return : node.child, filter, goUp, ignoreStringType, recursionLimit - 1) ??
    reactFiberWalker(node.sibling, filter, goUp, ignoreStringType, recursionLimit - 1)
  );
}

export const awaitDispatch = (filter: string | ((payload: any) => boolean)) =>
  new Promise<any>(async (res) => {
    const filterFunc = typeof filter === "string" ? (payload) => payload?.type === filter : filter;
    const unintercept = intercept((p: any) => {
      if (filterFunc(p)) {
        res(p);
        unintercept();
      }
    });
  });

export function log(text: any, func?: "log" | "warn" | "error"): void;
export function log(text: any[], func?: "log" | "warn" | "error"): void;
export function log(text: any[], func: "log" | "warn" | "error" = "log") {
  console[func](
    "%cshelter%c",
    "background: linear-gradient(180deg, #2A3B4B 0%, #2BFAAC 343.17%); color: white; padding: 6px; border-radius: 4px;",
    "",
    ...(Array.isArray(text) ? text : [text]),
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
export function createSubscription<TState, TStoreData = Record<string, any>>(
  store: FluxStore<TStoreData>,
  getStateFromStore: (store: FluxStore<TStoreData>) => TState,
): () => TState {
  const [data, setData] = createSignal(getStateFromStore(store));

  const cb = () => setData(() => getStateFromStore(store));
  store.addChangeListener(cb);
  onCleanup(() => store.removeChangeListener(cb));

  return data;
}

export const storeAssign = <T>(store: T, toApply: T) => batch(() => Object.assign(store, toApply));

export const sleep = (ms = 0) => new Promise((r) => setTimeout(r, ms));

// pretty-print an error
export function prettifyError(e: any) {
  if (typeof e !== "object") return `[Unknown Error]: ${e}`;

  // yes, Error.prototype.name exists, however other types may not use it e.g.
  const errorNameRaw = e.constructor?.name;
  const errorName = !errorNameRaw || errorNameRaw === "Object" ? "[Unknown Error]" : errorNameRaw;

  // are we a real error object? we should have a stack trace!
  if (typeof e.stack === "string") {
    // are we on a chromium browser? if so, the stack already contains the error
    if (e.stack.startsWith(errorName)) return e.stack;

    // add the error to the start of the stack trace, to match chromium behaviour:
    return `${errorName}: ${e.message ?? e + ""}\n${e.stack}`;
  }

  // okay, we don't have a stack, let's just print the thing
  return `${errorName}: ${e.message ?? e + ""}`;
}

export * from "./scopedApi";
