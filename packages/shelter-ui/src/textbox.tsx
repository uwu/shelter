import { type Component, createEffect, type JSX, mergeProps, splitProps } from "solid-js";
import { css, classes } from "./textbox.tsx.scss";
import { focusring } from "./focusring";
import { ensureInternalStyle } from "./internalstyles";
false && focusring;

type TextBoxProps = {
  value?: string;
  onInput?(v: string): void;

  /**
   * Backwards compatibility alias for aria-labelledby
   * @deprecated
   */
  "aria-label"?: string;
  /**
   * Backwards compatibility alias for maxlength
   * @deprecated
   */
  maxLength?: number;
};
export const TextBox: Component<
  TextBoxProps &
    Omit<JSX.InputHTMLAttributes<HTMLInputElement>, keyof TextBoxProps | "type" | "class" | "classList" | "ref">
> = (rawProps) => {
  ensureInternalStyle(css);

  const [local, other] = splitProps(
    mergeProps(
      {
        maxlength: rawProps.maxLength ?? 999,
        "aria-labelledby": rawProps["aria-label"],
      },
      rawProps,
    ),
    ["value", "onInput", "aria-label", "maxLength"],
  );

  let r: HTMLInputElement;
  createEffect(() => {
    // only set value if it changed, to avoid unnecessary resets of scroll position from doing value = value
    if (r && local.value !== r.value) {
      r.value = local.value;
    }
  });

  return (
    <input
      use:focusring
      class={classes.tbox}
      type="text"
      ref={r}
      onInput={(e) => local.onInput((e.target as HTMLInputElement).value)}
      {...other}
    />
  );
};

type TextAreaProps = {
  value?: string;
  onInput?(v: string): void;

  /**
   * Allow resizing horizontally
   */
  "resize-x"?: boolean;

  /**
   * Allow resizing vertically
   */
  "resize-y"?: boolean;

  /**
   * Monospace font
   */
  mono?: boolean;

  /**
   * Backwards compatibility alias for aria-labelledby
   * @deprecated
   */
  "aria-label"?: string;
  /**
   * Unused
   * @deprecated
   */
  width?: string;
  /**
   * Unused
   * @deprecated
   */
  height?: string;
};
export const TextArea: Component<
  TextAreaProps &
    Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, keyof TextAreaProps | "ref" | "class" | "classList">
> = (rawProps) => {
  ensureInternalStyle(css);

  const [local, other] = splitProps(
    mergeProps(
      {
        "aria-labelledby": rawProps["aria-label"],
      },
      rawProps,
    ),
    ["value", "resize-x", "resize-y", "mono", "onInput"],
  );

  let r: HTMLTextAreaElement;
  createEffect(() => {
    if (local.value !== r?.value && r) {
      r.value = local.value;
    }
  });

  return (
    <textarea
      use:focusring
      classList={{
        [classes.tarea]: true,
        [classes.rx]: local["resize-x"],
        [classes.ry]: local["resize-y"],
        [classes.mono]: local.mono,
      }}
      ref={r}
      // TODO: e.currentTarget?
      onInput={(e) => local.onInput((e.target as HTMLTextAreaElement).value)}
      {...other}
    />
  );
};
