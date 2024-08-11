import { type Component, type JSX, mergeProps, splitProps } from "solid-js";
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

/**
 * [background, color, hover:background]
 */
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

/**
 * [width, height, class]
 */
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
  /**
   * Fill width
   */
  grow?: boolean;
  tooltip?: JSX.Element;

  /**
   * overwritten to exclude plain string
   */
  style?: JSX.CSSProperties;

  /**
   * backwards-compatibility alias
   * @deprecated Use onDblClick instead
   */
  onDoubleClick?: (e: Event) => void;
};

export const Button: Component<ButtonProps & Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonProps>> = (
  rawProps,
) => {
  const [local, buttonProps] = splitProps(
    mergeProps(
      {
        look: ButtonLooks.FILLED,
        color: ButtonColors.BRAND,
        size: ButtonSizes.SMALL,
        grow: false,
        type: "button",
        onDblClick: rawProps.onDoubleClick,
      },
      rawProps,
    ),
    [
      "look",
      "color",
      "size",
      "grow",
      "tooltip",
      "style",
      "onDoubleClick",
      "class",
      // TODO: can children just be spread react-style too?
      "children",
    ],
  );

  ensureInternalStyle(css);

  return (
    <button
      use:focusring
      use:tooltip={local.tooltip}
      class={`${local.class} ${classes.button} ${local.look} ${local.size[2]} ${local.grow ? classes.grow : ""}`}
      style={{
        "--shltr-btn-w": local.size[0],
        "--shltr-btn-h": local.size[1],
        "--shltr-btn-col": local.color[1],
        "--shltr-btn-bg": local.color[0],
        "--shltr-btn-bg-hov": local.color[2],
        ...local.style,
      }}
      {...buttonProps}
    >
      {local.children}
    </button>
  );
};

type LinkButtonProps = {
  tooltip?: JSX.Element;
} & JSX.AnchorHTMLAttributes<HTMLAnchorElement>;

export const LinkButton: Component<LinkButtonProps> = (rawProps) => {
  const [local, anchorProps] = splitProps(
    mergeProps(
      {
        target: "_blank",
      },
      rawProps,
    ),
    ["tooltip", "children"],
  );

  ensureInternalStyle(css);

  return (
    <a use:focusring use:tooltip={local.tooltip} {...anchorProps}>
      {local.children}
    </a>
  );
};
