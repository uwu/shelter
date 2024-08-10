// A tree that stores the signals to back a store

import { Accessor, createSignal, Signal, untrack } from "solid-js";

export type SignalTreeRoot = {
  children: Record<string, SignalTreeNode>;
  sig: Accessor<any>;
  type: "root";
  update(): void;
};

export type SignalTreeNode = {
  //path: string[];
  //parent: SignalTreeNode | SignalTreeRoot;
} & (
  | {
      type: "undefined" | "boolean" | "number" | "bigint" | "string" | "symbol" | "function";
      sig: Signal<any>;
      root: SignalTreeRoot;
    }
  | { type: "object"; children: Record<string, SignalTreeNode>; root: SignalTreeRoot }
);

const mapValues = <TIn, TOut>(value: Record<string, TIn>, mapper: (v: TIn) => TOut): Record<string, TOut> =>
  Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapper(v)]));

export function makeRoot(): SignalTreeRoot {
  const [sig, setSig] = createSignal<any>();

  const root = {
    type: "root" as const,
    children: {},
    sig,
    update: () => void setSig(valueOfUnreactive(root)),
  };

  return root;
}

export function makeNode(value: any, root: SignalTreeRoot): SignalTreeNode {
  const type = typeof value;

  if (type === "object") {
    const n = {
      type,
      children: {},
      root,
    };
    for (const k in value) {
      n.children[k] = makeNode(value[k], root);
    }
    return n;
  } else {
    return {
      type,
      sig: createSignal(value /*, {equals: false}*/),
      root,
    };
  }
}

export function getNode(tree: SignalTreeNode | SignalTreeRoot, path: string[]) {
  for (let i = 0; i < path.length; i++)
    switch (tree.type) {
      case "object":
      case "root":
        if (i === path.length - 1) return tree.children[path[i]];
        else tree = tree.children[path[i]];
        break;

      default:
        throw new Error(`cannot index type ${tree.type} with key - this should NOT happen EVER`);
    }
}

export function valueOfUnreactive(tree: SignalTreeNode | SignalTreeRoot) {
  switch (tree.type) {
    case "object":
    case "root":
      return () => mapValues(tree.children, valueOfUnreactive);

    default:
      return untrack(() => tree.sig[0]);
  }
}

export function set(tree: SignalTreeNode | SignalTreeRoot, path: string[], value: any): boolean {
  if (path.length === 0) {
    switch (tree.type) {
      case "object":
      case "root":
        // TODO: this kills all reactivity, we need some way around that.
        // TODO: actually, do we though? is this fine? - sink 2024-08-10
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
