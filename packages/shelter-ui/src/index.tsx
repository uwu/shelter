import { type JSX, splitProps } from "solid-js";
import { type NativeExtendingComponent } from "./wrapperTypes";

export * from "./util";
export * from "./button";
export * from "./checkbox";
export * from "./switch";
export * from "./header";
export * from "./openModal";
export * from "./modals";
export * from "./icons";
export * from "./textbox";
export * from "./errorboundary";
export * from "./toasts";
export * from "./focusring";
export * from "./tooltip";
export * from "./slider";
export * from "./text";
export { InternalStyles, injectInternalStyles } from "./internalstyles";

type DividerProps = {
  mt?: boolean | string;
  mb?: boolean | string;
  // overwritten to exclude plain string
  style?: JSX.CSSProperties;
};
export const Divider: NativeExtendingComponent<DividerProps, JSX.HTMLAttributes<HTMLDivElement>, "role"> = (props) => {
  const [local, divProps] = splitProps(props, ["mt", "mb", "style"]);

  return (
    <div
      // arguably this should be a <hr /> but UA styles beloved
      role="separator"
      {...divProps}
      style={{
        "margin-top": typeof local.mt === "string" ? local.mt : local.mt ? "20px" : "",
        "margin-bottom": typeof local.mb === "string" ? local.mb : local.mb ? "20px" : "",
        width: "100%",
        height: "1px",
        "border-top": "thin solid var(--background-modifier-accent)",
        ...local.style,
      }}
    />
  );
};

type SpaceProps = {
  // overwritten to exclude plain string
  style?: JSX.CSSProperties;
};
export const Space: NativeExtendingComponent<SpaceProps, JSX.HTMLAttributes<HTMLPreElement>> = (props) => (
  <pre
    {...props}
    style={{
      display: "inline",
      ...props.style,
    }}
  >
    {" "}
  </pre>
);
