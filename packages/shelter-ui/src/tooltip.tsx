import { type Accessor, type Component, createEffect, createSignal, type JSX, onCleanup, onMount } from "solid-js";
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

const verticalOffset = 8;

const ToolTip: Component<{
  left: number;
  top: number;
  width: number;
  bottom: number;
  children: JSX.Element;
  active: boolean;
  under: boolean;
}> = (props) => {
  let contentWrapRef: HTMLDivElement;

  // 190px is just an estimate, as it is equal to max-width
  // we will need to actually measure content
  const [tooltipWidth, setTooltipWidth] = createSignal(190);

  let resizeObserver: ResizeObserver;

  onMount(() => {
    if (!contentWrapRef) return;

    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const contentWidth = entry.contentRect.width;
        setTooltipWidth(25 + Math.ceil(contentWidth));
      }
    });

    const target = contentWrapRef.firstElementChild ?? contentWrapRef;
    resizeObserver.observe(target);
  });

  onCleanup(() => {
    resizeObserver?.disconnect();
  });

  createEffect(() => {
    props.children; // sub - trigger re-measurement when content changes
  });

  return (
    <div
      classList={{
        [classes.tooltip]: true,
        [classes.active]: props.active,
      }}
      style={
        {
          width: tooltipWidth() ? tooltipWidth() + "px" : undefined,
          left: props.left + props.width / 2 - tooltipWidth() / 2 + "px",
          top: props.under ? props.bottom + verticalOffset + "px" : undefined,
          bottom: !props.under ? window.innerHeight - props.top + verticalOffset + "px" : undefined,
          "transform-origin": `50% ${props.under ? 0 : 100}%`, // SolidJS supports hyphenated CSS properties
        } as JSX.CSSProperties
      }
    >
      <div class={`${classes.pointer} ${props.under ? classes.under : ""}`} />
      <div class={classes.content} ref={contentWrapRef}>
        {props.children instanceof Node ? props.children : <span>{props.children}</span>}
      </div>
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

  // used for positioning
  const [rect, setRect] = createSignal(el.getBoundingClientRect());
  const updateRect = () => {
    setRect(el.getBoundingClientRect());
  };

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

  let isInside;

  const moveHandler = (clientX: number, clientY: number) => {
    const bounding = el.getBoundingClientRect();
    if (!bounding) {
      setActive(false);
      return;
    }

    // if inside the bounding box
    if (clientX > bounding.left && clientX < bounding.right && clientY > bounding.top && clientY < bounding.bottom) {
      if (!isInside) {
        isInside = true;
        enterHandler();
      }
    } else {
      isInside = false;
      // top tip: if you need to debug tooltips, comment this line right here :) -- sink
      exitHandler();
    }
  };

  const mouseMoveHandler = (e: MouseEvent) => {
    moveHandler(e.clientX, e.clientY);
  };

  const wheelHandler = (e: WheelEvent) => {
    moveHandler(e.clientX, e.clientY);
    exitHandler();
  };

  window.addEventListener("wheel", wheelHandler, { passive: true });
  window.addEventListener("resize", updateRect);

  window.addEventListener("mousemove", mouseMoveHandler, { passive: true });

  onCleanup(() => {
    window.removeEventListener("wheel", wheelHandler);
    window.removeEventListener("resize", updateRect);

    window.removeEventListener("mousemove", mouseMoveHandler);

    toolTipElem?.remove();
  });
}
