import { type Component, createEffect, type JSX, mergeProps, splitProps, createSignal } from "solid-js";
import { css, classes } from "./textbox.tsx.scss";
import { focusring } from "./focusring";
import { ensureInternalStyle } from "./internalstyles";
import { type NativeExtendingComponent } from "./wrapperTypes";
false && focusring;

type TextBoxProps = {
  value?: string;
  onInput?(v: string): void;
  type?: string;

  /**
   * Backwards compatibility alias for maxlength
   * @deprecated
   */
  maxLength?: number;
};
export const TextBox: NativeExtendingComponent<
  TextBoxProps,
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "class" | "classList" | "ref"
> = (rawProps) => {
  ensureInternalStyle(css);

  const [local, other] = splitProps(
    mergeProps(
      {
        maxlength: rawProps.maxLength ?? 999,
        type: "text",
      },
      rawProps,
    ),
    ["value", "onInput", "maxLength", "type"],
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
      type={local.type}
      ref={r}
      onInput={(e) => local.onInput?.((e.target as HTMLInputElement).value)}
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
   * Whether to show or not the char counter
   */
  counter?: boolean;

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
export const TextArea: NativeExtendingComponent<
  TextAreaProps,
  JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "ref" | "class" | "classList"
> = (rawProps) => {
  ensureInternalStyle(css);
  const [counter, setCounter] = createSignal(0);

  const [local, other] = splitProps(rawProps, ["value", "resize-x", "resize-y", "mono", "onInput", "counter"]);

  let r: HTMLTextAreaElement;
  createEffect(() => {
    if (local.value !== r?.value && r) {
      r.value = local.value;
    }
  });

  return (
    <div class={classes.wrapper}>
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
        onInput={(e) => {
          setCounter(e.currentTarget.value.length);
          local.onInput?.((e.target as HTMLTextAreaElement).value);
        }}
        {...other}
      />
      {local.counter && (
        <div class={classes.counter} aria-hidden="true">
          {counter()}
        </div>
      )}
    </div>
  );
};
