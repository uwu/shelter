import { Component, JSX } from "solid-js";

export * from "./button";
export * from "./switch";

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

let initedStyle: HTMLStyleElement;

export const initCss = () => {
  document.head.append(
    (initedStyle = (
      <style>
        {`
.SHLTR_BTN{transition:background-color .17s ease,color .17s ease;color:var(--shltr-btn-col);background:var(--shltr-btn-bg);cursor:pointer;display:flex;justify-content:center;align-items:center;border:none;border-radius:3px;font-size:14px;font-weight:500;line-height:16px;padding:2px 16px;user-select:none}.SHLTR_BTN:hover{background:var(--shltr-btn-bg-hov)}
`}
      </style>
    ) as HTMLStyleElement)
  );

  return () => {
    initedStyle.remove();
    initedStyle = undefined;
  }
};

export const Text: Component<{ children: JSX.Element }> = (props) => (
  <span
    style={{
      color: "var(--text-normal)",
    }}
  >
    {props.children}
  </span>
);

export const Divider: Component = () => (
  <div
    style={{
      "margin-top": "20px",
      width: "100%",
      height: "1px",
      "border-top": "thin solid var(--background-modifier-accent)",
    }}
  />
);