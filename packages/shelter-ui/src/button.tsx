import { type JSX, mergeProps, splitProps } from "solid-js";
import { classes, css } from "./button.tsx.scss";
import { focusring } from "./focusring";
import { tooltip } from "./tooltip";
import { ensureInternalStyle } from "./internalstyles";
import { type NativeExtendingComponent } from "./wrapperTypes";
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
 * [[background, color, hover:background, active:background, border-color], [background, color, hover:background, active:background, border-color]]
 */
type ButtonColor = [[string, string, string, string, string], [string, string, string, string, string], string];

// discord actually has `null` as the bg for white & link hovers which is funny
// also they have tons of overloads for red and green which is equally funny
// and the only thing better than a brand coloured buttons is a brand_new coloured button!!! -- sink
export const ButtonColors = {
  // COLOUR: [filled][bg, fg, hover, active, border], [outline][bg, fg, hover, active, border], [link]
  BRAND: [
    [
      "var(--button-filled-brand-background)",
      "var(--button-filled-brand-text)",
      "var(--button-filled-brand-background-hover)",
      "var(--button-filled-brand-background-active)",
      "var(--button-filled-brand-border)",
    ],
    [
      "var(--button-outline-brand-background)",
      "var(--button-outline-brand-text)",
      "var(--button-outline-brand-background-hover)",
      "var(--button-outline-brand-background-active)",
      "var(--button-outline-brand-border)",
    ],
    "var(--brand-500)",
  ],

  RED: [
    [
      "var(--button-danger-background)",
      "var(--white)",
      "var(--button-danger-background-hover)",
      "var(--button-danger-background-active)",
      "var(--button-danger-border)",
    ],
    [
      "var(--button-outline-danger-background)",
      "var(--button-outline-danger-text)",
      "var(--button-outline-danger-background-hover)",
      "var(--button-outline-danger-background-active)",
      "var(--button-outline-danger-border)",
    ],
    "var(--text-danger)",
  ],

  GREEN: [
    [
      "var(--button-positive-background)",
      "var(--white)",
      "var(--button-positive-background-hover)",
      "var(--button-positive-background-active)",
      "var(--button-positive-border)",
    ],
    [
      "none",
      "var(--button-outline-positive-text)",
      "var(--button-outline-positive-background-hover)",
      "var(--button-outline-positive-background-active)",
      "var(--button-outline-positive-border)",
    ],
    "var(--green-360)",
  ],

  PRIMARY: [
    [
      "var(--button-secondary-background)",
      "var(--button-secondary-text)",
      "var(--button-secondary-background-hover)",
      "var(--button-secondary-background-active)",
      "var(--border-faint)",
    ],
    [
      "none",
      "var(--button-outline-primary-text)",
      "var(--button-outline-primary-background-hover)",
      "var(--button-outline-primary-background-active)",
      "var(--button-outline-primary-border)",
    ],
    "var(--brand-360)",
  ],
  // Alias of primary for backwards compatibility
  SECONDARY: [
    [
      "var(--button-secondary-background)",
      "var(--button-secondary-text)",
      "var(--button-secondary-background-hover)",
      "var(--button-secondary-background-active)",
      "var(--border-faint)",
    ],
    [
      "none",
      "var(--button-outline-primary-text)",
      "var(--button-outline-primary-background-hover)",
      "var(--button-outline-primary-background-active)",
      "var(--button-outline-primary-border)",
    ],
    "var(--brand-360)",
  ],

  LINK: [
    ["var(--text-link)", "var(--white)", "var(--blue-500)", "var(--blue-530)", "var(--opacity-white-8)"],
    ["none", "var(--text-link)", "none", "none", "var(--text-link)"],
    "var(--brand-360)",
  ],

  WHITE: [
    [
      "var(--button-filled-white-background)",
      "var(--button-filled-white-text)",
      "var(--button-filled-white-background-hover)",
      "var(--button-filled-white-background-active)",
      "var(--opacity-8)",
    ],
    ["none", "var(--white)", "none", "var(--control-border-overlay-primary-active)", "var(--white)"],
    "var(--white)",
  ],

  TRANSPARENT: [
    [
      "var(--button-transparent-background)",
      "var(--button-transparent-text)",
      "var(--button-transparent-background-hover)",
      "var(--button-transparent-background-active)",
      "var(--border-faint)",
    ],
    [
      "none",
      "var(--text-default)",
      "none",
      "var(--button--outline--transparent-background-active",
      "var(--primary-200)",
    ],
    "var(--text-default)",
  ],
  // Alias of transparent for backwards compatibility
  BLACK: [
    [
      "var(--button-transparent-background)",
      "var(--button-transparent-text)",
      "var(--button-transparent-background-hover)",
      "var(--button-transparent-background-active)",
      "var(--border-faint)",
    ],
    [
      "none",
      "var(--text-default)",
      "none",
      "var(--button--outline--transparent-background-active",
      "var(--primary-200)",
    ],
    "var(--text-default)",
  ],
} satisfies Record<string, ButtonColor>;

/**
 * [width, height, class]
 */
type ButtonSize = [string, string, string];

export const ButtonSizes = {
  // SIZE: [width, height, class]
  NONE: ["", "", ""],
  TINY: ["52px", "24px", ""],
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
export const Button: NativeExtendingComponent<ButtonProps, JSX.ButtonHTMLAttributes<HTMLButtonElement>> = (
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

  const isOutlined = local.look === ButtonLooks.OUTLINED ? 1 : 0;
  const isLink = local.look === ButtonLooks.LINK; // toon link

  return (
    <button
      use:focusring
      use:tooltip={local.tooltip}
      class={`${local.class} ${classes.button} ${local.look} ${local.size[2]} ${local.grow ? classes.grow : ""}`}
      style={{
        "--shltr-btn-w": local.size[0],
        "--shltr-btn-h": local.size[1],
        "--shltr-btn-bg": local.color[isOutlined][0],
        "--shltr-btn-col": isLink ? local.color[2] : local.color[isOutlined][1],
        "--shltr-btn-bg-hov": local.color[isOutlined][2],
        "--shltr-btn-bg-act": local.color[isOutlined][3],
        "--shltr-btn-border": local.color[isOutlined][4],
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
};
export const LinkButton: NativeExtendingComponent<LinkButtonProps, JSX.AnchorHTMLAttributes<HTMLAnchorElement>> = (
  rawProps,
) => {
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
    <a class={classes.linkbutton} use:focusring use:tooltip={local.tooltip} {...anchorProps}>
      {local.children}
    </a>
  );
};
