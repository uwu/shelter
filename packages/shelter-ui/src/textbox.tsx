import { Component } from "solid-js";
import { css, classes } from "./textbox.tsx.scss";
import { injectCss } from "./util";

let injectedCss = false;

export const TextBox: Component<{
  value?: string;
  placeholder?: string;
  maxLength?: number;
  labelledBy?: string;
  onInput?(v: string): void;
}> = (props) => {
  if (!injectedCss) {
    injectedCss = true;
    injectCss(css);
  }

  return (
    <input
      class={classes.tbox}
      type="text"
      value={props.value}
      placeholder={props.placeholder}
      maxlength={props.maxLength ?? 999}
      aria-labelledby={props.labelledBy}
      onInput={(e) => props.onInput((e.target as HTMLInputElement).value)}
    />
  );
};

export const TextArea: Component<{
  value?: string;
  placeholder?: string;
  labelledBy?: string;
  onInput?(v: string): void;
  width?: string;
  height?: string;
  "resize-x"?: boolean;
  "resize-y"?: boolean;
  mono?: boolean;
}> = (props) => {
  if (!injectedCss) {
    injectedCss = true;
    injectCss(css);
  }

  return (
    <textarea
      classList={{
        [classes.tarea]: true,
        [classes.rx]: props["resize-x"],
        [classes.ry]: props["resize-y"],
        [classes.mono]: props.mono,
      }}
      value={props.value}
      placeholder={props.placeholder}
      aria-labelledby={props.labelledBy}
      onInput={(e) => props.onInput((e.target as HTMLTextAreaElement).value)}
    />
  );
};
