import { Component, JSX, mergeProps } from "solid-js";
import { injectCss } from "./util";
import { classes, css } from "./button.tsx.scss";

let injectedCss = false;

export const ButtonLooks = {
  FILLED: classes.filled,
  INVERTED: classes.inverted,
  OUTLINED: classes.outlined,
  LINK: classes.link,
  //BLANK,
};

type ButtonColor = [string, string, string];

// discord actually has `null` as the bg for white & link hovers which is funny
// also they have tons of overloads for red and green which is equally funny
// and the only thing better than a brand coloured buttons is a brand_new coloured button!!! -- sink
export const ButtonColors: Record<string, ButtonColor> = {
  // COLOUR: [bg, fg, hover]
  BRAND: ["var(--brand-experiment)", "var(--interactive-active)", "var(--brand-experiment-560)"],
  RED: ["var(--text-danger)", "var(--interactive-active)", "var(--button-danger-background-hover)"],
  GREEN: ["var(--button-positive-background)", "var(--interactive-active)", "var(--button-positive-background-hover)"],
  SECONDARY: [
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

type ButtonSize = [string, string, string];

export const ButtonSizes: Record<string, ButtonSize> = {
  // SIZE: [width, height, class]
  NONE: ["", "", ""],
  TINY: ["53px", "24px", ""],
  SMALL: ["60px", "32px", ""],
  MEDIUM: ["96px", "38px", ""],
  LARGE: ["130px", "44px", ""],
  XLARGE: ["148px", "50px", classes.xlarge],
  MIN: ["auto", "auto", classes.large],
  MAX: ["100%", "100%", classes.max],
  ICON: ["", "auto", classes.icon],
};

export const Button: Component<{
  look?: string;
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

  return (
    <button
      onClick={props.onClick}
      onDblClick={props.onDoubleClick}
      aria-label={props["aria-label"]}
      type={props.type}
      disabled={props.disabled}
      class={`${props.class} ${classes.button} ${props.look} ${props.size[2]} ${props.grow ? classes.grow : ""}`}
      style={{
        "--shltr-btn-w": props.size[0],
        "--shltr-btn-h": props.size[1],
        "--shltr-btn-col": props.color[1],
        "--shltr-btn-bg": props.color[0],
        "--shltr-btn-bg-hov": props.color[2],
        ...props.style,
      }}
    >
      {props.children}
    </button>
  );
};
