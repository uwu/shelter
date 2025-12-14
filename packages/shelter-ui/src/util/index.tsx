import { css as sBarCss, classes as sBarClasses } from "../scrollbars.scss";
import { ensureInternalStyle } from "../internalstyles";

export * from "./ReactiveRoot";

export * from "./createPersistenceHelper";

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
export const getRoot = (el: Node) =>
  el instanceof ShadowRoot || (el as Element).tagName === "DIALOG" || el === document.body
    ? el
    : getRoot(el.parentNode);
