import { Component, JSX, mergeProps } from "solid-js";
import { injectCss } from "./util";

const css = `.SHLTR_BTN{transition:background-color .17s ease,color .17s ease;color:var(--shltr-btn-col);background:var(--shltr-btn-bg);cursor:pointer;display:flex;justify-content:center;align-items:center;border:none;border-radius:3px;font-size:14px;font-weight:500;line-height:16px;padding:2px 16px;user-select:none}.SHLTR_BTN:hover{background:var(--shltr-btn-bg-hov)}`;
let injectedCss = false;

export enum ButtonLooks {
  FILLED,
  INVERTED,
  OUTLINED,
  LINK,
  //BLANK,
}

type ButtonColor = [string, string, string];

// discord actually has `null` as the bg for white & link hovers which is funny
// also they have tons of overloads for red and green which is equally funny
// and the only thing better than a brand coloured buttons is a brand_new coloured button!!! -- sink
export const ButtonColors: Record<string, ButtonColor> = {
  // COLOUR: [bg, fg, hover]
  BRAND: ["var(--brand-experiment)", "var(--interactive-active)", "var(--brand-experiment-560)"],
  RED: ["var(--text-danger)", "var(--interactive-active)", "var(--button-danger-background-hover)"],
  GREEN: ["var(--button-positive-background)", "var(--interactive-active)", "var(--button-positive-background-hover)"],
  PRIMARY: [
    "var(--button-secondary-background)",
    "hsl(0,calc(var(--saturation-factor, 1)*0%),100%)",
    "var(--button-secondary-background-hover)",
  ],
  LINK: ["var(--text-link)", "hsl(0,calc(var(--saturation-factor, 1)*0%),100%)", ""],
  WHITE: [
    "hsl(0,calc(var(--saturation-factor, 1)*0%),100%)",
    "hsl(217,calc(var(--saturation-factor, 1)*7.6%),33.5%)",
    "",
  ],
  BLACK: ["", "", ""], // discord legit leaves black entirely unstyled
  TRANSPARENT: [
    "hsla(0,calc(var(--saturation-factor, 1)*0%),100%,.1)",
    "hsl(240,calc(var(--saturation-factor, 1)*5.9%),96.7%)",
    "hsla(0,calc(var(--saturation-factor, 1)*0%),100%,.05)",
  ],
};

type ButtonSize = [string, string, JSX.CSSProperties?];

export const ButtonSizes: Record<string, ButtonSize> = {
  // SIZE: [width, height, extra]
  NONE: ["", ""],
  TINY: ["53px", "24px"],
  SMALL: ["60px", "32px"],
  MEDIUM: ["96px", "38px"],
  LARGE: ["130px", "44px"],
  XLARGE: ["148px", "50px", { "font-size": "16px", "line-height": "normal", padding: "2px 20px" }],
  MIN: ["auto", "auto", { padding: "2px 4px", display: "inline" }],
  MAX: ["100%", "100%", { "font-size": "16px" }],
  ICON: ["", "auto", { padding: "4px" }],
};

export const Button: Component<{
  look?: ButtonLooks;
  color?: ButtonColor;
  size?: ButtonSize;
  grow?: boolean;
  disabled?: boolean;
  type?: "button" | "reset" | "submit";
  style?: JSX.CSSProperties;
  class?: string;
  onClick?: (e: Event) => void;
  onDoubleClick?: (e: Event) => void;
  "aria-label"?: string;
  children?: JSX.Element;
}> = (rawProps) => {
  const props = mergeProps(
    {
      look: ButtonLooks.FILLED,
      color: ButtonColors.BRAND,
      size: ButtonSizes.SMALL,
      grow: false,
      type: "button",
      class: "",
    },
    rawProps
  );

  if (!injectedCss) {
    injectCss(css);
    injectedCss = true;
  }

  const btnCol = () => (props.look === ButtonLooks.INVERTED ? props.color[0] : props.color[1]);

  const btnBg = () =>
    props.look === ButtonLooks.OUTLINED || props.look === ButtonLooks.LINK
      ? "transparent"
      : props.look === ButtonLooks.INVERTED
      ? props.color[1]
      : props.color[0];

  const btnBgHov = () =>
    props.look === ButtonLooks.INVERTED
      ? btnBg()
      : props.look === ButtonLooks.LINK
      ? "transparent"
      : props.look === ButtonLooks.OUTLINED
      ? props.color[0]
      : props.color[2];

  return (
    <button
      onClick={props.onClick}
      onDblClick={props.onDoubleClick}
      aria-label={props["aria-label"]}
      type={props.type}
      disabled={props.disabled}
      class={props.class + " SHLTR_BTN"}
      style={{
        width: props.grow ? props.size[0] : "auto",
        height: props.size[1],
        border: props.look === ButtonLooks.OUTLINED && `1px solid ${props.color[0]}`,
        "min-width": props.size[0],
        "min-height": props.size[1],
        "--shltr-btn-col": btnCol(),
        "--shltr-btn-bg": btnBg(),
        "--shltr-btn-bg-hov": btnBgHov(),
        ...props.size[2],
        ...props.style,
      }}
    >
      {props.children}
    </button>
  );
};
