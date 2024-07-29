import { Component, JSX, mergeProps, splitProps } from "solid-js";
import { classes, css } from "./button.tsx.scss";
import { focusring } from "./focusring";
import { tooltip } from "./tooltip";
import { ensureInternalStyle } from "./internalstyles";
false && focusring;
false && tooltip;

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
export const ButtonColors = {
  // COLOUR: [bg, fg, hover]
  BRAND: ["var(--brand-500)", "var(--interactive-active)", "var(--brand-560)"],
  RED: ["var(--button-danger-background)", "var(--interactive-active)", "var(--button-danger-background-hover)"],
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
} satisfies Record<string, ButtonColor>;

type ButtonSize = [string, string, string];

export const ButtonSizes = {
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
} satisfies Record<string, ButtonSize>;

type ButtonProps = {
  look?: string;
  color?: ButtonColor;
  size?: ButtonSize;
  grow?: boolean;
  tooltip?: JSX.Element;

  // backwards-compatibility alias
  onDoubleClick?: (e: Event) => void;

  // overwritten to exclude plain string
  style?: JSX.CSSProperties;
};

export const Button: Component<ButtonProps & Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonProps>> = (
  rawProps,
) => {
  const props = mergeProps(
    {
      look: ButtonLooks.FILLED,
      color: ButtonColors.BRAND,
      size: ButtonSizes.SMALL,
      grow: false,
      type: "button",
    },
    rawProps,
  );

  const [local, buttonProps] = splitProps(rawProps, [
    "look",
    "color",
    "size",
    "grow",
    "tooltip",
    "style",
    "onDoubleClick",
    "class",
  ]);

  ensureInternalStyle(css);

  return (
    <button
      use:focusring
      use:tooltip={local.tooltip}
      onDblClick={local.onDoubleClick}
      class={`${props.class} ${classes.button} ${props.look} ${props.size[2]} ${props.grow ? classes.grow : ""}`}
      style={{
        "--shltr-btn-w": props.size[0],
        "--shltr-btn-h": props.size[1],
        "--shltr-btn-col": props.color[1],
        "--shltr-btn-bg": props.color[0],
        "--shltr-btn-bg-hov": props.color[2],
        ...props.style,
      }}
      {...buttonProps}
    >
      {props.children}
    </button>
  );
};

type LinkButtonProps = {
  tooltip?: JSX.Element;
} & JSX.AnchorHTMLAttributes<HTMLAnchorElement>;

export const LinkButton: Component<LinkButtonProps> = (rawProps) => {
  const props = mergeProps(
    {
      target: "_blank",
    },
    rawProps,
  );

  const [local, anchorProps] = splitProps(props, ["tooltip"]);

  ensureInternalStyle(css);

  return (
    <a use:focusring use:tooltip={local.tooltip} {...anchorProps}>
      {props.children}
    </a>
  );
};
