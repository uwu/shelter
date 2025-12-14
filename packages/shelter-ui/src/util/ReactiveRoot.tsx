import { Component, JSX } from "solid-js";
import { render } from "solid-js/web";

class ReactiveRootElem extends HTMLElement {
  // children
  c: () => JSX.Element;
  // dispose
  d?: () => void;

  constructor(children: () => JSX.Element) {
    super();
    this.c = children;
  }

  connectedCallback() {
    this.style.display = "contents";
    this.d?.();
    this.d = render(() => <>{this.c()}</>, this);
  }

  disconnectedCallback() {
    this.d?.();
  }
}

customElements.define("shltr-rroot", ReactiveRootElem);

export const ReactiveRoot: Component<{ children: JSX.Element }> = (props) => {
  // @ts-expect-error web components moment
  const root = (<shltr-rroot></shltr-rroot>) as ReactiveRootElem;
  root.c = () => props.children;
  return root;
};
