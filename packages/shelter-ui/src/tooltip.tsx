import type { JSX } from "solid-js"; // esbuild bug?
import { onCleanup, Component, Accessor, createSignal, createEffect, on } from "solid-js";
import { getRoot, injectCss } from "./util";
import { classes, css } from "./tooltip.tsx.scss";

let cssInjected = false;

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      tooltip: JSX.Element | [boolean, JSX.Element];
    }
  }
}

const ToolTip: Component<{
  left: number;
  top: number;
  width: number;
  bottom: number;
  children: JSX.Element;
  active: boolean;
  under: boolean;
}> = (props) => {
  let tooltipRef: HTMLDivElement;

  // default is just an estimate
  const [tooltipWidth, setTooltipWidth] = createSignal(props.width);

  createEffect(on([() => props.children], () => setTimeout(() => setTooltipWidth(tooltipRef.clientWidth))));

  return (
    <div
      ref={tooltipRef}
      classList={{
        [classes.tooltip]: true,
        [classes.active]: props.active,
      }}
      style={{
        left: props.left + props.width / 2 - tooltipWidth() / 2 + "px",
        top: props.under ? props.bottom + "px" : undefined,
        bottom: !props.under ? window.innerHeight - props.top + "px" : undefined,
        "transform-origin": `50% ${props.under ? 0 : 100}%`,
      }}
    >
      <div class={classes.content}>{props.children}</div>
    </div>
  );
};

// TODO: set these up in existing components
export function tooltip(el: HTMLElement, props: Accessor<JSX.Element | [boolean, JSX.Element]>) {
  const propsIsArr = () => Array.isArray(props()) && typeof props()[0] === "boolean";
  const content = () => (propsIsArr() ? props()[1] : props());
  const underneath = () => (propsIsArr() ? props()[0] : false);

  // used for animation
  const [active, setActive] = createSignal(false);

  let toolTipElem: HTMLDivElement;

  const enterHandler = () => {
    // use:tooltip is intended to be used a lot - on every shelter-ui element behind a prop
    // so optimizing away the undefined case is good.
    if (content() === undefined) return;

    if (!cssInjected) {
      injectCss(css);
      cssInjected = true;
    }

    toolTipElem?.remove();
    toolTipElem = (
      <ToolTip active={active()} under={underneath()} {...el.getBoundingClientRect()}>
        {content()}
      </ToolTip>
    ) as HTMLDivElement;

    getRoot(el).append(toolTipElem);
    setTimeout(() => setActive(true));
  };

  const exitHandler = () => {
    setActive(false);

    setTimeout(() => {
      // try prevent people breaking it
      if (active()) return;
      toolTipElem?.remove();
      toolTipElem = undefined;
    }, 100);
  };

  el.addEventListener("mouseenter", enterHandler);
  el.addEventListener("mouseleave", exitHandler);

  onCleanup(() => {
    el.removeEventListener("mouseenter", enterHandler);
    el.removeEventListener("mouseleave", exitHandler);

    toolTipElem?.remove();
  });
}
