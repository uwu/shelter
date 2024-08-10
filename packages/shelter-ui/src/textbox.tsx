import { Component, createEffect } from "solid-js";
import { css, classes } from "./textbox.tsx.scss";
import { focusring } from "./focusring";
import { ensureInternalStyle } from "./internalstyles";
false && focusring;

export const TextBox: Component<{
  value?: string;
  placeholder?: string;
  maxLength?: number;
  id?: string;
  "aria-label"?: string;
  onInput?(v: string): void;
}> = (props) => {
  ensureInternalStyle(css);

  let r: HTMLInputElement;
  createEffect(() => {
    // only set value if it changed, to avoid unnecessary resets of scroll position from doing value = value
    if (props.value !== r?.value && r) r.value = props.value;
  });

  return (
    <input
      use:focusring
      class={classes.tbox}
      type="text"
      ref={r}
      placeholder={props.placeholder}
      maxlength={props.maxLength ?? 999}
      id={props.id}
      aria-labelledby={props["aria-label"]}
      onInput={(e) => props.onInput((e.target as HTMLInputElement).value)}
    />
  );
};

export const TextArea: Component<{
  value?: string;
  placeholder?: string;
  id?: string;
  "aria-label"?: string;
  onInput?(v: string): void;
  width?: string;
  height?: string;
  "resize-x"?: boolean;
  "resize-y"?: boolean;
  mono?: boolean;
}> = (props) => {
  ensureInternalStyle(css);

  let r: HTMLTextAreaElement;
  createEffect(() => {
    if (props.value !== r?.value && r) r.value = props.value;
  });

  return (
    <textarea
      use:focusring
      classList={{
        [classes.tarea]: true,
        [classes.rx]: props["resize-x"],
        [classes.ry]: props["resize-y"],
        [classes.mono]: props.mono,
      }}
      ref={r}
      placeholder={props.placeholder}
      id={props.id}
      aria-labelledby={props["aria-label"]}
      onInput={(e) => props.onInput((e.target as HTMLTextAreaElement).value)}
    />
  );
};
