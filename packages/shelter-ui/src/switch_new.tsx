import { type Component, createEffect, type JSX, on, Show, splitProps } from "solid-js";
import { genId } from "./util";
import { Divider } from "./index";
import { css, classes } from "./switch_new.tsx.scss";
import { focusring } from "./focusring";
import { tooltip } from "./tooltip";
import { ensureInternalStyle } from "./internalstyles";
import { type NativeExtendingComponent } from "./wrapperTypes";
false && focusring;
false && tooltip;

const PATHS_1_X = "M5.13231 6.72963L6.7233 5.13864L14.855 13.2704L13.264 14.8614L5.13231 6.72963Z";
const PATHS_1_BAR = "M6.56666 11.0013L6.56666 8.96683L13.5667 8.96683L13.5667 11.0013L6.56666 11.0013Z";
const PATHS_1_CHECK = "M7.89561 14.8538L6.30462 13.2629L14.3099 5.25755L15.9009 6.84854L7.89561 14.8538Z";

const PATHS_2_X = "M13.2704 5.13864L14.8614 6.72963L6.72963 14.8614L5.13864 13.2704L13.2704 5.13864Z";
const PATHS_2_BAR = "M13.5582 8.96683L13.5582 11.0013L6.56192 11.0013L6.56192 8.96683L13.5582 8.96683Z";
const PATHS_2_CHECK = "M4.08643 11.0903L5.67742 9.49929L9.4485 13.2704L7.85751 14.8614L4.08643 11.0903Z";

// for where all these magic constants come from, see https://uwu.network/~sink/blog/2024/03/switchanim -- sink

const TIMING_POINTS = [0, 0.3, 0.7, 1];
const SPLINES = ["0.46 0.33 0.61 0.65", "0.26 0.45 0.65 0.88", "0.19 0.43 0.42 0.82"];
const DURATION = 225;
const COL_GRAY = "#80848e";
const COL_GREEN = "#23a55a";
const PATHS_1 = [PATHS_1_X, PATHS_1_BAR, PATHS_1_BAR, PATHS_1_CHECK];
const PATHS_2 = [PATHS_2_X, PATHS_2_BAR, PATHS_2_BAR, PATHS_2_CHECK];
const X_OFFSETS = [-3, 1, 8, 12];
//const VALUES = [0, 0.515, 0.93, 1];
//const LERPED_COLS = [COL_GRAY, "#648e7e", "#3f9b6a", COL_GREEN];

const Slider: Component<{ state: boolean }> = (props) => {
  let animateViewBox: SVGAnimateElement;
  let animatePath1: SVGAnimateElement;
  let animatePath2: SVGAnimateElement;
  let animateRectWidth: SVGAnimateElement;
  let animateRectHeight: SVGAnimateElement;
  let animateRectX: SVGAnimateElement;
  let animateRectY: SVGAnimateElement;

  // on() lets me use defer to not run on the first call
  createEffect(
    on(
      [() => props.state],
      ([s]) => {
        animateViewBox.setAttribute(
          "values",
          (s ? X_OFFSETS : X_OFFSETS.slice().reverse()).map((x) => `${-x} 0 28 20`).join(";"),
        );
        animatePath1.setAttribute("values", s ? PATHS_1.join(";") : PATHS_1.slice().reverse().join(";"));
        animatePath2.setAttribute("values", s ? PATHS_2.join(";") : PATHS_2.slice().reverse().join(";"));

        // if values are set on render then goofy stuff happens, we need to assign them after the fact,
        // even tho they're static.
        animateRectWidth.setAttribute("values", "20; 28; 28; 20");
        animateRectHeight.setAttribute("values", "20; 18; 18; 20");
        animateRectX.setAttribute("values", "4; 0; 0; 4");
        animateRectY.setAttribute("values", "0; 1; 1; 0");

        animateViewBox.beginElement();
        animatePath1.beginElement();
        animatePath2.beginElement();
        animateRectWidth.beginElement();
        animateRectHeight.beginElement();
        animateRectX.beginElement();
        animateRectY.beginElement();
      },
      { defer: true },
    ),
  );

  const commonAnimateProps = {
    dur: DURATION + "ms",
    calcMode: "spline",
    keyTimes: TIMING_POINTS.join(";"),
    keySplines: SPLINES.join(";"),
    repeatCount: 1,
  } as JSX.AnimateSVGAttributes<any>;

  return (
    <svg
      viewBox={`${props.state ? -12 : 3} 0 28 20`}
      width="34"
      height="18"
      preserveAspectRatio="xMinYMid meet"
      class={classes.slider}
    >
      <animate ref={animateViewBox} attributeName="viewBox" {...commonAnimateProps} />

      <rect fill="white" rx="10" width="20" height="20" x="4" y="0">
        <animate ref={animateRectWidth} attributeName="width" {...commonAnimateProps} />
        <animate ref={animateRectHeight} attributeName="height" {...commonAnimateProps} />
        <animate ref={animateRectX} attributeName="x" {...commonAnimateProps} />
        <animate ref={animateRectY} attributeName="y" {...commonAnimateProps} />
      </rect>
      <svg viewBox="0 0 20 20" fill="none">
        <path
          style={`transition: fill ${DURATION}ms`}
          fill={props.state ? COL_GREEN : COL_GRAY}
          d={props.state ? PATHS_1_CHECK : PATHS_1_X}
        >
          <animate ref={animatePath1} attributeName="d" {...commonAnimateProps} />
        </path>
        <path
          style={`transition: fill ${DURATION}ms`}
          fill={props.state ? COL_GREEN : COL_GRAY}
          d={props.state ? PATHS_2_CHECK : PATHS_2_X}
        >
          <animate ref={animatePath2} attributeName="d" {...commonAnimateProps} />
        </path>
      </svg>
    </svg>
  );
};

type SwitchProps = {
  onChange?(newVal: boolean): void;
  tooltip?: JSX.Element;
};
export const Switch: NativeExtendingComponent<SwitchProps, JSX.InputHTMLAttributes<HTMLInputElement>, "type"> = (
  rawProps,
) => {
  ensureInternalStyle(css);

  const [local, other] = splitProps(rawProps, ["onChange", "tooltip"]);

  return (
    <div
      class={`${classes.switch} ${other.disabled ? classes.disabled : ""}`}
      style={{
        "--shltr-sw-col": other.checked ? COL_GREEN : COL_GRAY,
        "--shltr-sw-dur": DURATION + "ms",
      }}
    >
      {/* the slider */}
      <Slider state={other.checked} />
      {/* the actual input: useful for accessibility etc */}
      <input
        use:focusring={12}
        use:tooltip={local.tooltip}
        onchange={() => local.onChange?.(!other.checked)}
        {...other}
      />
    </div>
  );
};

type SwitchItemProps = SwitchProps & {
  children: JSX.Element;
  note?: JSX.Element;
  hideBorder?: boolean;
};
export const SwitchItem: NativeExtendingComponent<
  SwitchItemProps,
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "type" | "id"
> = (rawProps) => {
  const id = genId();

  // TODO: allow external "id" prop?
  const [local, other] = splitProps(rawProps, ["children", "note", "hideBorder"]);

  return (
    <div class={classes.sitem}>
      <div class={classes.irow}>
        <label for={id}>{local.children}</label>
        <div>
          <Switch id={id} {...other} />
        </div>
      </div>

      <Show when={local.note} keyed>
        <div class={classes.note}>{local.note}</div>
      </Show>

      <Show when={!local.hideBorder} keyed>
        <Divider mt />
      </Show>
    </div>
  );
};
