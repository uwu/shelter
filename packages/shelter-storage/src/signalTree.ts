// A tree that stores the signals to back a store

import { Accessor, createEffect, createMemo, createSignal, Setter, Signal, untrack } from "solid-js";
import { ObjPath } from "./deep";

export type SignalTreeRoot = {
  children: Record<string, SignalTreeNode>;
  sig: Signal<any>;
  type: "root";
  // when called by a child node, tells the parent to update its listen on a given child key
  updateKey(newkey: string): void;
  rmKey(oldkey: string): void; // like above but removes a key
};

export type SignalTreeNode = {
  parent: SignalTreeNode | SignalTreeRoot;
  sig: Signal<any>;
} & (
  | {
      type: "undefined" | "boolean" | "number" | "bigint" | "string" | "symbol" | "function";
      set: Setter<any>;
    }
  | {
      type: "object" | "array";
      children: Record<string, SignalTreeNode>;
      updateKey(newkey: string): void; // see tree root
      rmKey(oldkey: string): void;
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

const subsToObj = (subs: Record<string, Accessor<any>>, isArr = false) => {
  const obj = isArr ? [] : {};
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
        s[newkey] = this.children[newkey].sig[0];
        return s;
      });
    },
    rmKey(oldkey: string) {
      setSubs((s) => {
        delete s[oldkey];
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

    const n: SignalTreeNode = {
      type: Array.isArray(value) ? "array" : "object",
      parent,
      children: {},
      sig: adoptSig ?? createSignal(),
      updateKey(newkey: string) {
        setSubs((s) => {
          s[newkey] = this.children[newkey].sig[0];
          return s;
        });
      },
      rmKey(oldkey: string) {
        setSubs((s) => {
          delete s[oldkey];
          return s;
        });
      },
    };

    for (const k in value) {
      n.children[k] = makeNode(value[k], n);
      n.updateKey(k);
    }

    createEffect(() => {
      n.sig[1](subsToObj(subs(), n.type === "array"));
    });

    return n;
  } else {
    adoptSig ??= createSignal();
    adoptSig[1](() => value);
    return { type, parent, sig: adoptSig, set: adoptSig[1] };
  }
}

export function getNode(tree: SignalTreeNode | SignalTreeRoot, path: string[]) {
  if (path.length === 0) return tree;

  for (let i = 0; i < path.length; i++) {
    if (tree === undefined) return undefined;

    switch (tree.type) {
      case "object":
      case "array":
      case "root":
        if (i === path.length - 1) return tree.children[path[i]];
        else tree = tree.children[path[i]];
        break;

      default:
        throw new Error(`cannot index type ${tree.type} with key - this should NOT happen EVER`);
    }
  }
}

export function getValue(tree: SignalTreeNode | SignalTreeRoot, path: ObjPath) {
  if (path.length === 0) return tree;

  switch (tree.type) {
    case "object":
    case "array":
    case "root":
      if (path[0] in tree.children && typeof path[0] === "string") {
        if (path.length === 1) return tree.children[path[0]].sig[0]();
        else return getValue(tree.children[path[0]], path.slice(1));
      } else if (path.length === 1 && tree.type === "array" && path[0] in Array.prototype)
        return Array.prototype[path[0]];
      else return undefined;

    default:
      let val = tree.sig[0]();
      while (path.length > 0) {
        val = val[path[0]];
        path.shift();
      }
      return val;
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
      case "array":
      case "root":
        const childNode = tree.children[key];

        if (childNode === undefined) {
          // brand new node
          tree.children[key] = makeNode(value, tree);
          tree.updateKey(key);
        } else if (childNode.type !== "object" && childNode.type !== "array") {
          if (typeofValue === "object") {
            // convert value node to object node
            tree.children[key] = makeNode(value, tree, childNode.sig);
            tree.updateKey(key);
          } else {
            // fast path: value -> value
            childNode.type = typeofValue;
            // @ts-expect-error what
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
      case "array":
      case "root":
        return set(tree.children[path[0]], path.slice(1), value);

      default:
        return false;
    }
  }
}

export function delKey(tree: SignalTreeNode | SignalTreeRoot, path: string[]): boolean {
  if (path.length === 0) {
    // :(
    switch (tree.type) {
      case "root":
        return false;

      default:
        // slow, but this should very rarely be hit anyway
        // @ts-expect-error all parents are object or root
        const tpc = tree.parent.children;
        for (const k in tpc) {
          if (tree === tpc[k]) {
            return delKey(tree.parent, [k]);
          }
        }
        return false;
    }
  } else if (path.length === 1) {
    // :)
    const key = path[0];
    switch (tree.type) {
      case "root":
      case "array":
      case "object":
        delete tree.children[key];
        tree.rmKey(key);
        return true;

      default:
        return false;
    }
  } else {
    // recurse
    switch (tree.type) {
      case "root":
      case "array":
      case "object":
        return delKey(tree.children[path[0]], path.slice(1));

      default:
        return false;
    }
  }
}

export function has(tree: SignalTreeNode | SignalTreeRoot, path: string[]): boolean {
  if (path.length === 0) return false;

  if (path.length === 1) {
    switch (tree.type) {
      case "root":
      case "array":
      case "object":
        return path[0] in tree.children;

      default:
        return path[0] in untrack(tree.sig[0]);
    }
  } else {
    switch (tree.type) {
      case "root":
      case "array":
      case "object":
        return has(tree.children[path[0]], path.slice(1));

      default:
        return false;
    }
  }
}
