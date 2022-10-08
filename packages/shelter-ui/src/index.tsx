import { Component, JSX } from "solid-js";

export * from "./button";

let initedStyle: HTMLStyleElement;

export const initCss = () =>
  document.head.append(
    (initedStyle = (
      <style>
        {`
.SHLTR_BTN{transition:background-color .17s ease,color .17s ease;color:var(--shltr-btn-col);background:var(--shltr-btn-bg);cursor:pointer;display:flex;justify-content:center;align-items:center;border:none;border-radius:3px;font-size:14px;font-weight:500;line-height:16px;padding:2px 16px;user-select:none}.SHLTR_BTN:hover{background:var(--shltr-btn-bg-hov)}
`}
      </style>
    ) as HTMLStyleElement)
  );

export const uninitCss = () => {
  initedStyle.remove();
  initedStyle = undefined;
}

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