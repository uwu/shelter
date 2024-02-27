import type { JSX } from "solid-js"; // esbuild bug?
import { onCleanup, Component, Accessor, createSignal, createEffect, on } from "solid-js";
import { getRoot } from "./util";
import { classes, css } from "./tooltip.tsx.scss";
import { ensureInternalStyle } from "./internalstyles";

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

// TODO: set these up in existing components, document
export function tooltip(el: HTMLElement, props: Accessor<JSX.Element | [boolean, JSX.Element]>) {
  const propsIsArr = () => Array.isArray(props()) && typeof props()[0] === "boolean";
  const content = () => (propsIsArr() ? props()[1] : props());
  const underneath = () => (propsIsArr() ? props()[0] : false);

  // used for animation
  const [active, setActive] = createSignal(false);

  // used for positioning
  const [rect, setRect] = createSignal(el.getBoundingClientRect());
  const updateRect = () => {
    setRect(el.getBoundingClientRect());
  }

  let toolTipElem: HTMLDivElement;

  const enterHandler = () => {
    // use:tooltip is intended to be used a lot - on every shelter-ui element behind a prop
    // so optimizing away the undefined case is good.
    if (content() === undefined) return;
    updateRect();

    ensureInternalStyle(css);

    toolTipElem?.remove();
    toolTipElem = (
      <ToolTip active={active()} under={underneath()} {...rect()}>
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

  const [isInside, setIsInside] = createSignal(false);

  const moveHandler = (clientX: number, clientY: number) => {
    const bounding = el.getBoundingClientRect();
    if (!bounding) {
      setActive(false);
      return;
    }

    // if inside the bounding box
    if (
      clientX > bounding.left &&
      clientX < bounding.right &&
      clientY > bounding.top &&
      clientY < bounding.bottom
    ) {
      if (!isInside()) {
        setIsInside(true);
        enterHandler();
      }
    } else {
      exitHandler();
      setIsInside(false);
    }
  }

  const mouseMoveHandler = (e: MouseEvent) => {
    moveHandler(e.clientX, e.clientY);
  }

  const wheelHandler = (e: WheelEvent) => {
    moveHandler(e.clientX, e.clientY);
    exitHandler();
    setTimeout(() => moveHandler(e.clientX, e.clientY), 100);
  }

  window.addEventListener("wheel", wheelHandler);
  window.addEventListener("resize", updateRect);  

  window.addEventListener("mousemove", mouseMoveHandler);

  onCleanup(() => {

    window.removeEventListener("wheel", wheelHandler);
    window.removeEventListener("resize", updateRect);

    window.removeEventListener("mousemove", mouseMoveHandler);

    toolTipElem?.remove();
  });
}
