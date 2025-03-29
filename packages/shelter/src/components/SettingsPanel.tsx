import { Component, JSX, Show, createSignal } from "solid-js";
import { injectCss } from "@uwu/shelter-ui";
import { classes, css } from "./SettingsPanel.tsx.scss";
import { ChevronIcon } from "./Icons";

let injectedCss = false;

type SettingsPanelProps = {
  title: string;
  icon?: Component<JSX.SvgSVGAttributes<SVGSVGElement>>;
  children: JSX.Element;
  defaultOpen?: boolean;
  description?: string;
};

export const SettingsPanel = (props: SettingsPanelProps) => {
  if (!injectedCss) {
    injectedCss = true;
    injectCss(css);
  }

  const [isOpen, setIsOpen] = createSignal(props.defaultOpen ?? false);

  return (
    <div class={classes.settingspanel}>
      <button class={classes.header} onClick={() => setIsOpen(!isOpen())} aria-expanded={isOpen()}>
        <div class={classes.titleRow}>
          <Show when={!!props.icon} keyed>
            {(Icon) => <props.icon class={classes.icon} />}
          </Show>
          <span class={classes.title}>{props.title}</span>
          <Show when={props.description}>
            <span class={classes.description}>{props.description}</span>
          </Show>
        </div>
        <ChevronIcon class={classes.chevron} style={{ transform: isOpen() ? "rotate(180deg)" : "rotate(0deg)" }} />
      </button>
      <Show when={isOpen()}>
        <div class={classes.content}>{props.children}</div>
      </Show>
    </div>
  );
};
