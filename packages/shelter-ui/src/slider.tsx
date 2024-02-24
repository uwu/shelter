import { Component, JSX } from "solid-js";
import { classes, css } from "./slider.tsx.scss";
import { ensureInternalStyle } from "./internalstyles";

export const Slider: Component<{
  min: number;
  max: number;
  tick?: boolean | number;
  step?: number | "any";
  class?: string;
  style?: JSX.CSSProperties;
  onInput?(e: number): void;
  value?: number;
}> = (props) => {
  ensureInternalStyle(css);

  const ticks = () => {
    if (!props.tick || typeof props.step !== "number") return [];

    const spacing = props.tick === true ? props.step : props.tick;
    return Object.keys(Array(~~((props.max - props.min) / spacing) + 1).fill(0)).map((v) => parseInt(v) * spacing);
  };

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
        {ticks().map((t) => (
          <div class={classes.stick}>
            <span>{t}</span>
            <div class={classes.stickline}></div>
          </div>
        ))}
      </div>
    </div>
  );
};
