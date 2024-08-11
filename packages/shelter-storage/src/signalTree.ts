// A tree that stores the signals to back a store

import { Accessor, createEffect, createMemo, createSignal, Setter, Signal, untrack } from "solid-js";

export type SignalTreeRoot = {
  children: Record<string, SignalTreeNode>;
  //acc: Accessor<any>;
  sig: Signal<any>;
  type: "root";
  // when called by a child node, tells the parent to update its listen on a given child key
  updateKey(newkey: string): void;
};

export type SignalTreeNode = {
  //path: string[];
  parent: SignalTreeNode | SignalTreeRoot;
  //acc: Accessor<any>
  sig: Signal<any>;
} & (
  | {
      type: "undefined" | "boolean" | "number" | "bigint" | "string" | "symbol" | "function";
      set: Setter<any>;
    }
  | {
      type: "object";
      children: Record<string, SignalTreeNode>;
      updateKey(newkey: string): void; // see tree root
    }
);

/*
// Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapper(v)]));
function mapValues<TIn, TOut>(value: Record<string, TIn>, mapper: (v: TIn) => TOut): Record<string, TOut> {
  const mapped: Record<string, TOut> = {};
  for (const k in value)
    mapped[k] = mapper(value[k]);
  return mapped;
}
*/

const subsToObj = (subs: Record<string, Accessor<any>>) => {
  const obj = {};
  for (const k in subs) {
    obj[k] = subs[k]();
  }
  return obj;
};

export function makeRoot(adoptSig?: Signal<any>): SignalTreeRoot {
  const [subs, setSubs] = createSignal<Record<string, Accessor<any>>>({}, { equals: false });

  const root: SignalTreeRoot = {
    type: "root" as const,
    children: {},
    sig: adoptSig ?? createSignal(),
    updateKey(newkey: string) {
      setSubs((s) => {
        s[newkey] = this.children[newkey].acc;
        return s;
      });
    },
  };

  createEffect(() => {
    root.sig[1](subsToObj(subs()));
  });

  return root;
}

export function makeNode(value: any, parent: SignalTreeRoot | SignalTreeNode, adoptSig?: Signal<any>): SignalTreeNode {
  const type = typeof value;

  if (type === "object") {
    const [subs, setSubs] = createSignal<Record<string, Accessor<any>>>({}, { equals: false });

    const n = {
      type,
      parent,
      children: {},
      sig: adoptSig ?? createSignal(),
      updateKey(newkey: string) {
        setSubs((s) => {
          s[newkey] = this.children[newkey].acc;
          return s;
        });
      },
    };

    for (const k in value) {
      n.children[k] = makeNode(value[k], n);
    }

    createEffect(() => {
      n.sig[1](subsToObj(subs()));
    });

    return n;
  } else {
    adoptSig ??= createSignal();
    adoptSig[1](() => value);
    return { type, parent, sig: adoptSig, set: adoptSig[1] };
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

/*function calcValueOfUnreactive(tree: SignalTreeNode | SignalTreeRoot) {
  switch (tree.type) {
    case "object":
    case "root":
      return () => mapValues(tree.children, calcValueOfUnreactive);

    default:
      return untrack(() => tree.acc[0]);
  }
}*/

export function set(tree: SignalTreeNode | SignalTreeRoot, path: string[], value: any): boolean {
  const typeofValue = typeof value;

  if (path.length === 0) {
    // set the node itself directly, this is a rare unhappy case
    // only possible if DIRECTLY called with path: [], not via recursion.
    switch (tree.type) {
      case "root":
        // clean slate
        Object.assign(tree, makeRoot(tree.sig));
        if (typeofValue === "object") {
          // set props
          let success = true;
          for (const k in value) {
            success &&= set(tree, [k], value[k]);
          }
          return success;
        } else return false;

      default:
        // slow, but this should very rarely be hit anyway
        // @ts-expect-error all parents are object or root
        const tpc = tree.parent.children;
        for (const k in tpc) {
          if (tree === tpc[k]) {
            return set(tree.parent, [k], value);
          }
        }
        return false;
    }
  } else if (path.length === 1) {
    // set a child node of this node, happy case where we do the actual logic.
    const key = path[0];

    switch (tree.type) {
      case "object":
      case "root":
        const childNode = tree.children[key];
        if (childNode.type !== "object") {
          if (typeofValue === "object") {
            // convert value node to object node
            tree.children[key] = makeNode(value, tree, childNode.sig);
            tree.updateKey(key);
          } else {
            // fast path: value -> value
            childNode.type = typeofValue;
            childNode.set(() => value);
          }
        } else {
          if (typeofValue === "object") {
            // replace entire object
            tree.children[key] = makeNode(value, tree, childNode.sig);
            tree.updateKey(key);
          } else {
            // convert object node to value node
            tree.children[key] = makeNode(value, tree, childNode.sig);
            tree.updateKey(key);
          }
        }
        return true;

      default:
        return false;
    }
  } else {
    // set something far down the tree - most common case but we just recurse
    switch (tree.type) {
      case "object":
      case "root":
        return set(tree.children[path[0]], path.slice(1), value);

      default:
        return false;
    }
  }
}
