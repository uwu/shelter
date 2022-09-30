import type { JSXElement } from "solid-js";
import { Component, JSX } from "solid-js";
/*
let initedStyle: HTMLStyleElement;

export const initCss = () =>
  document.head.append(
    (initedStyle = (
      <style>
        {`

`}
      </style>
    ) as HTMLStyleElement)
  );

export const uninitCss = () => {
  initedStyle.remove();
  initedStyle = undefined;
}*/

export const Text: Component<{ children: JSXElement }> = (props) => (
  <span
    style={{
      color: "var(--text-normal)",
    }}
  >
    {props.children}
  </span>
);

export const FormText = Text;

export const FormDivider: Component = () => (
  <div
    style={{
      "margin-top": "20px",
      width: "100%",
      height: "1px",
      "border-top": "thin solid var(--background-modifier-accent)",
    }}
  />
);

export const FormSection: Component<{
  children: JSXElement;
  [k: string]: any;
}> = (props) => <div {...props} />;

enum ButtonLooks {
  FILLED,
  INVERTED,
  OUTLINED,
  LINK,
  BLANK,
}

enum ButtonColors {
  BRAND,
  RED,
  GREEN,
  PRIMARY,
  LINK,
  WHITE,
  BLACK,
  TRANSPARENT,
  BRAND_NEW,
}

enum ButtonHovers {
  DEFAULT,
  BRAND,
  RED,
  GREEN,
  PRIMARY,
  LINK,
  WHITE,
  BLACK,
  TRANSPARENT,
}

enum ButtonSizes {
  NONE,
  TINY,
  SMALL,
  MEDIUM,
  LARGE,
  XLARGE,
  MIN,
  MAX,
  ICON,
}

export const Button: Component<{
  look?: ButtonLooks;
  color?: ButtonColors;
  borderColor?: ButtonColors;
  hover?: ButtonHovers;
  size?: ButtonSizes;
  grow?: boolean;
  disabled?: boolean;
  type?: "button" | "reset" | "submit";
  style?: JSX.CSSProperties;
  className?: string;
  onClick?: (e: Event) => void;
  onDoubleClick?: (e: Event) => void;
  onMouseDown?: (e: Event) => void;
  onMouseUp?: (e: Event) => void;
  onMouseEnter?: (e: Event) => void;
  onMouseLeave?: (e: Event) => void;
  onKeyDown?: (e: Event) => void;
  "aria-label"?: string;
  children?: JSXElement;
}> = (props) => (
  <button
    onClick={props.onClick}
    onDblClick={props.onDoubleClick}
    onMouseDown={props.onMouseDown}
    onMouseUp={props.onMouseUp}
    onMouseEnter={props.onMouseEnter}
    onMouseLeave={props.onMouseLeave}
    onKeyDown={props.onKeyDown}
    aria-label={props["aria-label"]}
    type={props.type}
    disabled={props.disabled}
    class={props.className}
    style={{
      cursor: "pointer",
      display: "flex",
      "justify-content": "center",
      "align-items": "center",
      background: "none",
      border: "none",
      "border-radius": "3px",
      "font-size": "14px",
      "font-weight": "500",
      "line-height": "16px",
      padding: "2px 16px",
      "user-select": "none",
      width: props.grow && "auto",
      ...props.style
    }}
  >
    {props.children}
  </button>
); // TODO: add colours and looks and sizes and hovers