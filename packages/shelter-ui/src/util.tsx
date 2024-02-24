import { Component, JSX } from "solid-js";
import { render } from "solid-js/web";
import { css as sBarCss, classes as sBarClasses } from "./scrollbars.scss";
import { ensureInternalStyle } from "./internalstyles";

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

let injectedStyles: HTMLStyleElement[] = [];

export const cleanupCss = () => {
  injectedStyles.forEach((e) => e.remove());
  injectedStyles = [];
};

export const injectCss = (css: string) => {
  const e = (<style>{css}</style>) as HTMLStyleElement;
  document.body.append(e);
  injectedStyles.push(e);

  return (css?: string) => {
    if (css === undefined) {
      e.remove();
      injectedStyles = injectedStyles.filter((v) => v !== e);
    } else e.textContent = css;
  };
};

// useful for when we don't need an ID for semantic purposes but do want one for another reason
// such as accessibility or <label for={ID}>
export const genId = () => "shltr-ui-" + Math.random().toString(36).slice(2);

export const niceScrollbarsClass = () => {
  ensureInternalStyle(sBarCss);
  return sBarClasses.scrollbar;
};

// just using document.body is not enough with dialog.showModal(), we must find the specific layer's root
export const getRoot = (el) => (el.tagName === "DIALOG" || el === document.body ? el : getRoot(el.parentElement));
