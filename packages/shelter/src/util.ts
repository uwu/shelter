import getDispatcher from "./getDispatcher";

interface Fiber extends Record<any, any> {
  // TODO: maybe type this lol
}

declare global {
  interface Element {
    __reactFiber$: Fiber;
  }
}

export const getFiber = (n: Element): Fiber => n.__reactFiber$;

export function reactFiberWalker(node: Fiber, prop: string | symbol, goUp = false): Fiber {
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
