import { Component, JSX } from "solid-js";
import { render } from "solid-js/web";

export const ReactiveRoot: Component<{ children: JSX.Element }> = (props) => {
  const root = (<div style="display:contents" />) as HTMLDivElement;

  const dispose = render(() => <>{props.children}</>, root);
  root.addEventListener("DOMNodeRemovedFromDocument", dispose);

  return root;
};

let injectedStyles: HTMLStyleElement[] = [];

export const cleanupCss = () => {
  injectedStyles.forEach((e) => e.remove());
  injectedStyles = [];
};

export const injectCss = (css: string) => {
  const e = (<style>{css}</style>) as HTMLStyleElement;
  document.head.append(e);
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
