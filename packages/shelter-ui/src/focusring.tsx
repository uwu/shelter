import { onCleanup, Component, Accessor } from "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      focusring: number | true;
    }
  }
}

const FocusRing: Component<{ x: number; y: number; width: number; height: number; rad: number }> = (props) => (
  <div
    style={{
      position: "absolute",
      left: props.x + "px",
      top: props.y + "px",
      width: props.width + "px",
      height: props.height + "px",
      outline: "#00a8fc solid",
      "outline-offset": "3px",
      "border-radius": props.rad + "px",
      "z-index": 9999999,
    }}
  />
);

export function focusring(el: Element, rad: Accessor<number>) {
  const isFocused = () => el === document.activeElement;
  let lastFocused = isFocused();

  let focusRingEl: HTMLDivElement;

  const keyHandler = (ev) => {
    if (lastFocused || !isFocused()) return;
    lastFocused = true;

    focusRingEl?.remove();
    focusRingEl = (
      <FocusRing rad={typeof rad() === "number" ? rad() : 3} {...el.getBoundingClientRect()} />
    ) as HTMLDivElement;
    document.body.append(focusRingEl);
  };

  const blurHandler = () => {
    lastFocused = false;
    focusRingEl?.remove();
    focusRingEl = undefined;
  };

  el.addEventListener("keyup", keyHandler);
  el.addEventListener("blur", blurHandler);

  onCleanup(() => {
    el.removeEventListener("keyup", keyHandler);
    el.removeEventListener("blur", blurHandler);

    focusRingEl.remove();
  });
}
