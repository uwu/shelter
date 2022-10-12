import { Component, JSX } from "solid-js";

// without comma in <T,> it parses it as JSX! (eg <T></T>)
export const withCleanup =
  <T,>(comp: (onCleanup: (cb: () => void) => void, props: T) => JSX.Element): Component<T> =>
  (props: T): JSX.Element => {
    // DOMNodeRemovedFromDocument is deprecated but 'cause we're not in a real solid app we (often) can't use onCleanup
    // (it should work if your element is inside a view rendered by shelter
    // maybe patch onCleanup to achieve this if we can't get it to work any other way?

    const cleanups = [];
    const ret = comp((cb) => void cleanups.push(cb), props);

    const elem = ret instanceof Element ? ret : ((<div style="display:contents">{ret}</div>) as HTMLDivElement);

    elem.addEventListener("DOMNodeRemovedFromDocument", () => cleanups.forEach((c) => c()));

    return elem;
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
