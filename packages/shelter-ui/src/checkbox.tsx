import { Component, JSX, Show } from "solid-js";
import { css, classes } from "./checkbox.tsx.scss";
import { genId } from "./util";
import { focusring } from "./focusring";
import { tooltip } from "./tooltip";
import { ensureInternalStyle } from "./internalstyles";
false && focusring;
false && tooltip;

const CheckIcon: Component<{
  state: boolean;
}> = (props) => (
  <div
    classList={{
      [classes.icon]: true,
      [classes.active]: props.state,
    }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M8.99991 16.17L4.82991 12L3.40991 13.41L8.99991 19L20.9999 7.00003L19.5899 5.59003L8.99991 16.17Z"
      />
    </svg>
  </div>
);

export const CheckboxItem: Component<{
  checked?: boolean;
  disabled?: boolean;
  children?: JSX.Element;
  onChange?(newVal: boolean): void;
  mt?: boolean;
  id?: string;
  tooltip?: JSX.Element;
  "aria-label"?: string;
}> = (props) => {
  ensureInternalStyle(css);

  const id = genId();

  return (
    <div
      classList={{ [classes.cbwrap]: true, [classes.disabled]: props.disabled }}
      onclick={() => props.disabled || props.onChange?.(!props.checked)}
      style={props.mt ? "margin-top: 20px" : ""}
    >
      <div class={classes.checkbox}>
        <CheckIcon state={props.checked} />
        <input
          use:focusring
          use:tooltip={props.tooltip}
          id={props.id ?? id}
          type="checkbox"
          checked={props.checked}
          disabled={props.disabled}
          aria-label={props["aria-label"]}
        />
      </div>
      <Show when={props.children} keyed={false}>
        {/* TODO: make onclick work here */}
        <label for={id}>{props.children}</label>
      </Show>
    </div>
  );
};

export const Checkbox: Component<{
  checked?: boolean;
  disabled?: boolean;
  onChange?(newVal: boolean): void;
  id?: string;
  tooltip?: JSX.Element;
  "aria-label"?: string;
}> = (props) => <CheckboxItem {...props} />; // lazy lmao but it works
