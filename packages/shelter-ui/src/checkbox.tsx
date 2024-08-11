import { type Component, type JSX, Show, splitProps } from "solid-js";
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

type CheckboxItemProps = {
  onChange?(newVal: boolean): void;
  /**
   * Add margin-top: 20px
   */
  mt?: boolean;
  tooltip?: JSX.Element;
};

export const CheckboxItem: Component<
  CheckboxItemProps &
    // TODO: specifically only pick checkbox fields
    Omit<JSX.InputHTMLAttributes<HTMLInputElement>, keyof CheckboxItemProps>
> = (rawProps) => {
  const [local, checkboxProps] = splitProps(rawProps, ["onChange", "mt", "id", "tooltip", "children"]);

  ensureInternalStyle(css);

  const id = local.id ?? genId();

  return (
    <div
      classList={{ [classes.cbwrap]: true, [classes.disabled]: checkboxProps.disabled }}
      onclick={() => !checkboxProps.disabled && local.onChange?.(!checkboxProps.checked)}
      style={local.mt ? "margin-top: 20px" : ""}
    >
      <div class={classes.checkbox}>
        <CheckIcon state={checkboxProps.checked} />
        <input use:focusring use:tooltip={local.tooltip} id={id} {...checkboxProps} />
      </div>
      <Show when={local.children} keyed={false}>
        {/* TODO: make onclick work here */}
        <label for={id}>{local.children}</label>
      </Show>
    </div>
  );
};

type CheckboxProps = {
  onChange?(newVal: boolean): void;
  tooltip?: JSX.Element;
};
export const Checkbox: Component<CheckboxProps & Omit<JSX.InputHTMLAttributes<HTMLInputElement>, keyof CheckboxProps>> =
  (props) => <CheckboxItem {...props} />; // lazy lmao but it works
