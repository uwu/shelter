import { Component, JSX } from "solid-js";

export * from "./util";
export * from "./button";
export * from "./switch";

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