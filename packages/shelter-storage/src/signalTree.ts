// A tree that stores the signals to back a store

import { createSignal, Signal } from "solid-js";

export type SignalTreeRoot = {
  children: Record<string, SignalTreeNode>;
  sig: Signal<any>;
  type: "root";
};

export type SignalTreeNode = {
  //path: string[];
  //parent: SignalTreeNode | SignalTreeRoot;
} & (
  | { type: "undefined" | "boolean" | "number" | "bigint" | "string" | "symbol" | "function"; sig: Signal<any> }
  | { type: "object"; children: Record<string, SignalTreeNode> }
);

const mapValues = <TIn, TOut>(value: Record<string, TIn>, mapper: (v: TIn) => TOut): Record<string, TOut> =>
  Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapper(v)]));

export function makeNode(value: any): SignalTreeNode {
  const type = typeof value;

  return type === "object"
    ? {
        type,
        children: mapValues(value, makeNode),
      }
    : {
        type,
        sig: createSignal(value /*, {equals: false}*/),
      };
}

export function get(tree: SignalTreeNode | SignalTreeRoot, path: string[]) {
  for (let i = 0; i < path.length; i++)
    switch (tree.type) {
      case "object":
      case "root":
        if (i == path.length - 1) return tree.children[path[i]];
        else tree = tree.children[path[i]];
        break;

      default:
        throw new Error(`cannot index type ${tree.type} with key - this should NOT happen EVER`);
    }
}

export function signalOf(tree: SignalTreeNode | SignalTreeRoot) {
  switch (tree.type) {
    case "object":
    case "root":
      return () => mapValues(tree.children, signalOf);

    default:
      return tree.sig[0];
  }
}

export function set(tree: SignalTreeNode | SignalTreeRoot, path: string[], value: any): boolean {
  if (path.length === 0) {
    switch (tree.type) {
      case "object":
      case "root":
        // TODO: this kills all reactivity, we need some way around that.
        tree.children = mapValues(value, makeNode);
        break;

      default:
        tree.sig[1](() => value);
        return true;
    }
  } else {
    switch (tree.type) {
      case "object":
      case "root":
        return set(tree.children[path[0]], path.slice(1), value);

      default:
        return false;
    }
  }
}
