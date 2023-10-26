import { Component, JSX } from "solid-js";
import { css, classes } from "./slider.tsx.scss";
import { injectCss } from "./util";

let injectedCss = false;

export const Slider: Component<{
  min: number;
  max: number;
  // These are the little labelled ticks on the slider
  steps?: string[];
  step?: number | "any";
  class?: string;
  style?: JSX.CSSProperties;
  onInput?(e: number): void;
  value?: number;
}> = (props) => {
  if (!injectedCss) {
    injectedCss = true;
    injectCss(css);
  }

  return (
    <div class={classes.scontainer}>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step ?? "any"}
        class={classes.srange}
        value={props.value ? props.value : props.min}
        style={
          {
            ...props.style,
            "--upper-half": `${((props.value - props.min) / (props.max - props.min)) * 100}%`,
          } as JSX.CSSProperties
        }
        onInput={(e) => props.onInput?.(parseFloat((e.target as HTMLInputElement).value))}
      />
      <div class={classes.sticks}>
        {props.steps?.map((t) => (
          <div class={classes.stick}>
            <span>{t}</span>
            <div class={classes.stickline}></div>
          </div>
        ))}
      </div>
    </div>
  );
};
