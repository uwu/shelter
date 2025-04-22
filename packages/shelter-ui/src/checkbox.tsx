import { type Component, type JSX, Show, splitProps } from "solid-js";
import { css, classes } from "./checkbox.tsx.scss";
import { genId } from "./util";
import { focusring } from "./focusring";
import { tooltip } from "./tooltip";
import { ensureInternalStyle } from "./internalstyles";
import { type NativeExtendingComponent } from "./wrapperTypes";
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
        d="M19.06 6.94a1.5 1.5 0 0 1 0 2.12l-8 8a1.5 1.5 0 0 1-2.12 0l-4-4a1.5 1.5 0 0 1 2.12-2.12L10 13.88l6.94-6.94a1.5 1.5 0 0 1 2.12 0Z"
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
export const CheckboxItem: NativeExtendingComponent<
  CheckboxItemProps,
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "type"
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
        <input type="checkbox" use:focusring use:tooltip={local.tooltip} id={id} {...checkboxProps} />
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
export const Checkbox: NativeExtendingComponent<CheckboxProps, JSX.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <CheckboxItem {...props} />
);
