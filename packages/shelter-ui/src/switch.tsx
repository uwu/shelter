import { Component, createEffect, JSX, on, Show } from "solid-js";
import { genId, injectCss } from "./util";
import { Divider } from "./index";
import { css, classes } from "./switch.tsx.scss";

let injectedCss = false;

// good luck editing these by hand AND making them look good in animation :D --sink
const TickPath1 = " M 4.08643 11.0903 L 5.67742 9.49929 L 9.4485  13.2704 L 7.85751 14.8614 L 4.08643 11.0903 Z";
const TickPath2 = " M 14.3099 5.25755 L 15.9009 6.84854 L 7.89561 14.8538 L 6.30462 13.2629 L 14.3099 5.25755 Z";
const CrossPath1 = "M 5.13231 6.72963 L 6.7233  5.13864 L 14.855  13.2704 L 13.264  14.8614 L 5.13231 6.72963 Z";
const CrossPath2 = "M 13.2704 5.13864 L 14.8614 6.72963 L 6.72963 14.8614 L 5.13864 13.2704 L 13.2704 5.13864 Z";

const TickCol = " hsl(139, calc(var(--saturation-factor, 1) * 47.3%), 43.9%)";
const CrossCol = "hsl(218, calc(var(--saturation-factor, 1) * 4.6%) , 46.9%)";

const ButtonIcon: Component<{ state: boolean }> = (props) => {
  let animate1: SVGAnimateElement;
  let animate2: SVGAnimateElement;

  // on() lets me use defer to not run on the first call
  createEffect(
    on(
      [() => props.state],
      ([s]) => {
        // svg <animate> isn't like discord's animation by a long shot but it certainly looks tons better than just a snap
        animate1.setAttribute("values", s ? `${CrossPath1};${TickPath1}` : `${TickPath1};${CrossPath1}`);
        animate2.setAttribute("values", s ? `${CrossPath2};${TickPath2}` : `${TickPath2};${CrossPath2}`);

        animate1.beginElement();
        animate2.beginElement();
      },
      { defer: true }
    )
  );

  return (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        style="transition: fill 250ms"
        fill={props.state ? TickCol : CrossCol}
        d={props.state ? TickPath1 : CrossPath1}
      >
        <animate ref={animate1} dur="250ms" repeatCount={1} attributeName="d" />
      </path>
      <path
        style="transition: fill 250ms"
        fill={props.state ? TickCol : CrossCol}
        d={props.state ? TickPath2 : CrossPath2}
      >
        <animate ref={animate2} dur="250ms" repeatCount={1} attributeName="d" />
      </path>
    </svg>
  );
};

export const Switch: Component<{
  id?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?(newVal: boolean): void;
}> = (props) => {
  if (!injectedCss) {
    injectCss(css);
    injectedCss = true;
  }

  return (
    <div
      class={classes.switch}
      classList={{
        [classes.on]: props.checked,
        [classes.disabled]: props.disabled,
      }}
    >
      {/* the slider */}
      <div class={classes.slider}>
        <ButtonIcon state={props.checked} />
      </div>
      {/* the actual input: useful for accesibility etc */}
      <input
        id={props.id}
        type="checkbox"
        tabindex="0"
        checked={props.checked}
        disabled={props.disabled}
        onchange={() => props.onChange(!props.checked)}
      />
    </div>
  );
};

export const SwitchItem: Component<{
  value: boolean;
  onChange?(v: boolean): void;
  disabled?: boolean;
  children: JSX.Element;
  note?: JSX.Element;
  hideBorder?: boolean;
}> = (props) => {
  const id = genId();

  return (
    <div class={classes.sitem}>
      <div class={classes.irow}>
        <label for={id}>{props.children}</label>
        <div>
          <Switch id={id} checked={props.value} onChange={props.onChange} disabled={props.disabled} />
        </div>
      </div>

      <Show when={props.note} keyed>
        <div class={classes.note}>{props.note}</div>
      </Show>

      <Show when={!props.hideBorder} keyed>
        <Divider mt />
      </Show>
    </div>
  );
};
