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
  INVERTED: classes.filled, // alias for filled for backwards compatibility
  OUTLINED: classes.filled, // all these do not exist in the current design system (Mana)
  LINK: classes.filled, // This is handled by LinkButton instead
};

type ButtonColor = {
  backgroundDefault: string;
  backgroundHover: string;
  backgroundActive: string;
  textColorDefault: string;
  textColorHover: string;
  textColorActive: string;
  borderColorDefault: string;
  borderColorHover: string;
  borderColorActive: string;
};

const InternalButtonColors = {
  PRIMARY: {
    backgroundDefault: "var(--control-primary-background-default)",
    backgroundHover: "var(--control-primary-background-hover)",
    backgroundActive: "var(--control-primary-background-active)",
    textColorDefault: "var(--control-primary-text-default)",
    textColorHover: "var(--control-primary-text-hover)",
    textColorActive: "var(--control-primary-text-active)",
    borderColorDefault: "var(--control-primary-border-default)",
    borderColorHover: "var(--control-primary-border-hover)",
    borderColorActive: "var(--control-primary-border-active)",
  },
  SECONDARY: {
    backgroundDefault: "var(--control-secondary-background-default)",
    backgroundHover: "var(--control-secondary-background-hover)",
    backgroundActive: "var(--control-secondary-background-active)",
    textColorDefault: "var(--control-secondary-text-default)",
    textColorHover: "var(--control-secondary-text-hover)",
    textColorActive: "var(--control-secondary-text-active)",
    borderColorDefault: "var(--control-secondary-border-default)",
    borderColorHover: "var(--control-secondary-border-hover)",
    borderColorActive: "var(--control-secondary-border-active)",
  },
  CRITICAL_PRIMARY: {
    backgroundDefault: "var(--control-critical-primary-background-default)",
    backgroundHover: "var(--control-critical-primary-background-hover)",
    backgroundActive: "var(--control-critical-primary-background-active)",
    textColorDefault: "var(--control-critical-primary-text-default)",
    textColorHover: "var(--control-critical-primary-text-hover)",
    textColorActive: "var(--control-critical-primary-text-active)",
    borderColorDefault: "var(--control-critical-primary-border-default)",
    borderColorHover: "var(--control-critical-primary-border-hover)",
    borderColorActive: "var(--control-critical-primary-border-active)",
  },
  CRITICAL_SECONDARY: {
    backgroundDefault: "var(--control-critical-secondary-background-default)",
    backgroundHover: "var(--control-critical-secondary-background-hover)",
    backgroundActive: "var(--control-critical-secondary-background-active)",
    textColorDefault: "var(--control-critical-secondary-text-default)",
    textColorHover: "var(--control-critical-secondary-text-hover)",
    textColorActive: "var(--control-critical-secondary-text-active)",
    borderColorDefault: "var(--control-critical-secondary-border-default)",
    borderColorHover: "var(--control-critical-secondary-border-hover)",
    borderColorActive: "var(--control-critical-secondary-border-active)",
  },
  ACTIVE: {
    backgroundDefault: "var(--control-connect-background-default)",
    backgroundHover: "var(--control-connect-background-hover)",
    backgroundActive: "var(--control-connect-background-active)",
    textColorDefault: "var(--control-connect-text-default)",
    textColorHover: "var(--control-connect-text-hover)",
    textColorActive: "var(--control-connect-text-active)",
    borderColorDefault: "var(--control-connect-border-default)",
    borderColorHover: "var(--control-connect-border-hover)",
    borderColorActive: "var(--control-connect-border-active)",
  },
  OVERLAY_PRIMARY: {
    backgroundDefault: "var(--control-overlay-primary-background-default)",
    backgroundHover: "var(--control-overlay-primary-background-hover)",
    backgroundActive: "var(--control-overlay-primary-background-active)",
    textColorDefault: "var(--control-overlay-primary-text-default)",
    textColorHover: "var(--control-overlay-primary-text-hover)",
    textColorActive: "var(--control-overlay-primary-text-active)",
    borderColorDefault: "var(--control-overlay-primary-border-default)",
    borderColorHover: "var(--control-overlay-primary-border-hover)",
    borderColorActive: "var(--control-overlay-primary-border-active)",
  },
  OVERLAY_SECONDARY: {
    backgroundDefault: "var(--control-overlay-secondary-background-default)",
    backgroundHover: "var(--control-overlay-secondary-background-hover)",
    backgroundActive: "var(--control-overlay-secondary-background-active)",
    textColorDefault: "var(--control-overlay-secondary-text-default)",
    textColorHover: "var(--control-overlay-secondary-text-hover)",
    textColorActive: "var(--control-overlay-secondary-text-active)",
    borderColorDefault: "var(--control-overlay-secondary-border-default)",
    borderColorHover: "var(--control-overlay-secondary-border-hover)",
    borderColorActive: "var(--control-overlay-secondary-border-active)",
  },
} satisfies Record<string, ButtonColor>;

export const ButtonColors = {
  PRIMARY: "PRIMARY",
  SECONDARY: "SECONDARY",
  CRITICAL_PRIMARY: "CRITICAL_PRIMARY",
  CRITICAL_SECONDARY: "CRITICAL_SECONDARY",
  ACTIVE: "ACTIVE",
  OVERLAY_PRIMARY: "OVERLAY_PRIMARY",
  OVERLAY_SECONDARY: "OVERLAY_SECONDARY",

  // Aliases for old design system
  BRAND: "PRIMARY",
  RED: "CRITICAL_PRIMARY",
  GREEN: "ACTIVE",
  LINK: "PRIMARY", // This really doesnt map to anything. Just use PRIMARY cause its basically blue?
  WHITE: "OVERLAY_PRIMARY",
  TRANSPARENT: "SECONDARY",
  BLACK: "OVERLAY_SECONDARY",
} satisfies Record<string, string>;

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
  color?: string;
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

  const colorVars = InternalButtonColors[local.color];

  return (
    <button
      use:focusring
      use:tooltip={local.tooltip}
      class={`${local.class} ${classes.button} ${local.look} ${local.size[2]} ${local.grow ? classes.grow : ""}`}
      style={{
        "--shltr-btn-w": local.size[0],
        "--shltr-btn-h": local.size[1],

        "--shltr-btn-bg": colorVars.backgroundDefault,
        "--shltr-btn-bg-hov": colorVars.backgroundHover,
        "--shltr-btn-bg-act": colorVars.backgroundActive,

        "--shltr-btn-col": colorVars.textColorDefault,
        "--shltr-btn-col-hov": colorVars.textColorHover,
        "--shltr-btn-col-act": colorVars.textColorActive,

        "--shltr-btn-border": colorVars.borderColorDefault,
        "--shltr-btn-border-hov": colorVars.borderColorHover,
        "--shltr-btn-border-act": colorVars.borderColorActive,
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
