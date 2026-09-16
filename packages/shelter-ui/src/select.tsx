import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  splitProps,
  useContext,
  type JSX,
} from "solid-js";
import { css, classes } from "./select.tsx.scss";
import { ChevronIcon, CheckIcon } from "./icons";
import { ensureInternalStyle } from "./internalstyles";
import { Divider } from "./index";
import { focusring } from "./focusring";
import { tooltip } from "./tooltip";
import { genId } from "./util";
import { type NativeExtendingComponent } from "./wrapperTypes";
false && focusring;
false && tooltip;

export type SelectValue = string | number;

type SelectOptionProps = {
  value: SelectValue;
  disabled?: boolean;
};

type SelectContextValue = {
  select(v: SelectValue): void;
  current(): SelectValue | null;
  focused: () => SelectValue | null;
  setFocused(v: SelectValue | null): void;
  add(v: SelectValue, label: () => JSX.Element): void;
  remove(v: SelectValue): void;
};

const SelectCtx = createContext<SelectContextValue>();

export const SelectOption: NativeExtendingComponent<
  SelectOptionProps,
  JSX.HTMLAttributes<HTMLDivElement>,
  "id" | "role" | "aria-selected" | "onClick"
> = (rawProps) => {
  const ctx = useContext(SelectCtx);
  if (!ctx) {
    throw new Error("<SelectOption> must be used inside a <Select>");
  }

  const [local, optionProps] = splitProps(rawProps, ["value", "disabled", "children"]);

  createEffect(() => {
    ctx.add(local.value, () => local.children);
    onCleanup(() => ctx.remove(local.value));
  });

  const selected = createMemo(() => ctx.current() === local.value);
  const isFocused = createMemo(() => ctx.focused() === local.value);

  return (
    <div
      {...optionProps}
      role="option"
      aria-selected={selected()}
      classList={{
        [classes.option]: true,
        [classes.selected]: selected(),
        [classes.focused]: isFocused(),
        [classes.optionDisabled]: local.disabled,
        ...(optionProps.classList as Record<string, boolean> | undefined),
      }}
      onClick={() => !local.disabled && ctx.select(local.value)}
      onMouseEnter={() => !local.disabled && ctx.setFocused(local.value)}
    >
      <span class={classes.optionLabel}>{local.children}</span>
      {selected() && <CheckIcon class={classes.check} width="16" height="16" aria-hidden="true" />}
    </div>
  );
};

type SelectProps = {
  value?: SelectValue;
  onChange?(v: SelectValue): void;
  placeholder?: string;
  disabled?: boolean;
  tooltip?: JSX.Element;
  "aria-label"?: string;
  style?: JSX.CSSProperties;
};
export const Select: NativeExtendingComponent<SelectProps, JSX.HTMLAttributes<HTMLDivElement>, "role" | "tabindex"> = (
  rawProps,
) => {
  ensureInternalStyle(css);

  const [local, other] = splitProps(rawProps, [
    "value",
    "onChange",
    "placeholder",
    "disabled",
    "tooltip",
    "aria-label",
    "children",
    "id",
    "class",
    "classList",
    "style",
  ]);

  const [open, setOpen] = createSignal(false);
  const [focused, setFocused] = createSignal<SelectValue | null>(null);

  const [revision, bump] = createSignal(0);
  const labels = new Map<SelectValue, () => JSX.Element>();
  const values: SelectValue[] = [];

  const value = () => local.value ?? null;

  const ctx: SelectContextValue = {
    select: (v) => {
      setOpen(false);
      local.onChange?.(v);
    },
    current: value,
    focused,
    setFocused,
    add: (v, label) => {
      if (!values.includes(v)) values.push(v);
      labels.set(v, label);
      bump();
    },
    remove: (v) => {
      const i = values.indexOf(v);
      if (i !== -1) values.splice(i, 1);
      bump();
    },
  };

  const selectedLabel = createMemo(() => {
    const v = value();
    revision();
    if (v === null) return null;
    return labels.get(v)?.() ?? v;
  });

  const close = () => setOpen(false);

  const onToggle = () => {
    if (local.disabled) return;
    if (open()) close();
    else {
      setOpen(true);
      setFocused(local.value ?? null);
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (local.disabled) return;

    if (open()) {
      switch (e.key) {
        case "Escape":
          close();
          break;
        case "Enter": {
          const f = focused();
          if (f !== null) ctx.select(f);
          else close();
          break;
        }
        case "ArrowDown":
        case "ArrowUp": {
          e.preventDefault();
          const delta = e.key === "ArrowDown" ? 1 : -1;
          const idx = focused() === null ? (delta === 1 ? -1 : values.length) : values.indexOf(focused());
          const next = values[(idx + delta + values.length) % values.length];
          if (next !== undefined) setFocused(next);
          break;
        }
      }
    } else if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      setOpen(true);
      setFocused(local.value ?? values[0] ?? null);
    }
  };

  createEffect(() => {
    if (!open()) return;
    const closeOnOutside = (e: MouseEvent) => {
      const path = e.composedPath?.() ?? [e.target as Node];
      if (!path.includes(root)) close();
    };
    document.addEventListener("mousedown", closeOnOutside);
    onCleanup(() => document.removeEventListener("mousedown", closeOnOutside));
  });

  let root: HTMLDivElement;

  const menuId = genId();

  return (
    <SelectCtx.Provider value={ctx}>
      <div
        ref={root}
        {...other}
        class={classes.wrap + (local.class ? ` ${local.class}` : "")}
        classList={{
          [classes.open]: open(),
          ...(local.classList as Record<string, boolean> | undefined),
        }}
        style={local.style}
      >
        <button
          use:focusring
          use:tooltip={local.tooltip}
          id={local.id}
          class={classes.select}
          classList={{ [classes.disabled]: local.disabled }}
          type="button"
          role="combobox"
          aria-label={local["aria-label"]}
          aria-haspopup="listbox"
          aria-expanded={open()}
          aria-controls={menuId}
          disabled={local.disabled}
          onClick={onToggle}
          onKeyDown={onKeyDown}
        >
          <span classList={{ [classes.value]: true, [classes.placeholder]: value() === null }}>
            {selectedLabel() ?? local.placeholder}
          </span>
          <ChevronIcon class={classes.chevron} width="20" height="20" aria-hidden="true" />
        </button>

        <div id={menuId} class={classes.menu} role="listbox" aria-hidden={!open() || undefined}>
          {local.children}
        </div>
      </div>
    </SelectCtx.Provider>
  );
};

type SelectItemProps = SelectProps & {
  label: JSX.Element;
  note?: JSX.Element;
  hideBorder?: boolean;
};
export const SelectItem: NativeExtendingComponent<SelectItemProps, JSX.HTMLAttributes<HTMLDivElement>> = (rawProps) => {
  const id = genId();

  const [local, other] = splitProps(rawProps, ["label", "note", "hideBorder"]);

  return (
    <div class={classes.sitem}>
      <label class={classes.ititle} for={id}>
        {local.label}
      </label>
      <Select id={id} {...other} />
      {local.note !== undefined && <div class={classes.note}>{local.note}</div>}
      {!local.hideBorder && <Divider mt />}
    </div>
  );
};
