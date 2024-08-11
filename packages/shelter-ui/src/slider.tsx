import { type JSX, mergeProps, splitProps } from "solid-js";
import { classes, css } from "./slider.tsx.scss";
import { ensureInternalStyle } from "./internalstyles";
import { type NativeExtendingComponent } from "./wrapperTypes";

type SliderProps = {
  // solid JSX types kinda suck for input so I'm leaving these in

  min: number;
  max: number;
  tick?: boolean | number;
  step?: number | "any";
  value?: number;

  style?: JSX.CSSProperties;
  onInput?(e: number): void;
};
export const Slider: NativeExtendingComponent<SliderProps, JSX.InputHTMLAttributes<HTMLInputElement>, "type"> = (
  rawProps,
) => {
  ensureInternalStyle(css);

  const [local, other] = splitProps(
    mergeProps(
      {
        step: "any",
        value: rawProps.min,
      },
      rawProps,
    ),
    ["onInput", "style"],
  );

  const ticks = () => {
    if (!other.tick || typeof other.step !== "number") {
      return [];
    }

    const spacing = other.tick === true ? other.step : other.tick;
    return Object.keys(Array(Math.floor((other.max - other.min) / spacing) + 1).fill(0)).map(
      (v) => parseInt(v) * spacing,
    );
  };

  return (
    <div class={classes.scontainer}>
      <input
        type="range"
        {...other}
        class={classes.srange}
        style={
          {
            ...local.style,
            "--upper-half": `${((other.value - other.min) / (other.max - other.min)) * 100}%`,
          } satisfies JSX.CSSProperties
        }
        onInput={(e) => local.onInput?.(parseFloat((e.target as HTMLInputElement).value))}
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
