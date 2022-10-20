import { Component, JSX } from "solid-js";

export * from "./util";
export * from "./button";
export * from "./switch";
export * from "./header";
export * from "./openModal";
export * from "./modals";

export const Text: Component<{ children: JSX.Element }> = (props) => (
  <span
    style={{
      color: "var(--text-normal)",
    }}
  >
    {props.children}
  </span>
);

export const Divider: Component<{ mt?: boolean | string; mb?: boolean | string }> = (props) => (
  <div
    style={{
      "margin-top": typeof props.mt === "string" ? props.mt : props.mt ? "20px" : "",
      "margin-bottom": typeof props.mb === "string" ? props.mb : props.mb ? "20px" : "",
      width: "100%",
      height: "1px",
      "border-top": "thin solid var(--background-modifier-accent)",
    }}
  />
);
