import { Component, createRoot, getOwner } from "solid-js";

export const withCleanup =
  <T,>(comp: Component<T>): Component<T> =>
  (props) => {
    // DOMNodeRemovedFromDocument is deprecated but when react rips us off the dom this is the only way to know

    // if a reactive root already exists, we dont need to do this!
    if (getOwner()) return comp(props);

    return createRoot((dispose) => {
      const ret = comp(props);

      const elem = ret instanceof Element ? ret : ((<div style="display:contents">{ret}</div>) as HTMLDivElement);

      elem.addEventListener("DOMNodeRemovedFromDocument", dispose);

      return elem;
    });
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
