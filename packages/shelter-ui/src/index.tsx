import { Component, JSX } from "solid-js";

export * from "./util";
export * from "./button";
export * from "./checkbox";
export * from "./switch";
export * from "./header";
export * from "./openModal";
export * from "./modals";
export * from "./icons";
export * from "./textbox";
export * from "./bridges";
export * from "./errorboundary";
export * from "./toasts";
export * from "./focusring";
export * from "./tooltip";
export * from "./slider";

export const Text: Component<JSX.HTMLAttributes<HTMLSpanElement>> = (props) => (
  <span
    style={{
      color: "var(--text-normal)",
    }}
    {...props}
  />
);

export const Divider: Component<{ mt?: boolean | string; mb?: boolean | string }> = (props) => (
  <div
    // arguably this should be a <hr /> but UA styles beloved
    role="separator"
    style={{
      "margin-top": typeof props.mt === "string" ? props.mt : props.mt ? "20px" : "",
      "margin-bottom": typeof props.mb === "string" ? props.mb : props.mb ? "20px" : "",
      width: "100%",
      height: "1px",
      "border-top": "thin solid var(--background-modifier-accent)",
    }}
  />
);

export const Space: Component = () => <pre style="display:inline"> </pre>;
