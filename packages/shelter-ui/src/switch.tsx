import {Component, createEffect} from "solid-js";

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

  createEffect(() => {
    props.state; // goofy ahh dependency tracking
    if (!animate1 || !animate2) return;

    // svg <animate> isn't like discord's animation by a long shot but it certainly looks tons better than just a snap
    animate1.setAttribute("values", props.state ? `${CrossPath1};${TickPath1}` : `${TickPath1};${CrossPath1}`);
    animate2.setAttribute("values", props.state ? `${CrossPath2};${TickPath2}` : `${TickPath2};${CrossPath2}`);

    animate1.beginElement();
    animate2.beginElement();
  })

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

export const Switch: Component<{ checked?: boolean; disabled?: boolean; onChange?(newVal: boolean): void }> = (
  props
) => (
  <div
    style={{
      position: "relative",
      background: props.checked ? "hsl(139, calc(var(--saturation-factor, 1) * 47.3%), 43.9%)" : "hsl(218, calc(var(--saturation-factor, 1) * 4.6%), 46.9%)",
      height: "24px",
      width: "40px",
      "border-radius": "12px",
      transition: "background 250ms",
      opacity: props.disabled ? 0.3 : ""
    }}
  >
    {/* the slider */}
    <div
      style={{
        position: "absolute",
        left: "3px",
        top: "3px",
        height: "18px",
        width: "18px",
        "border-radius": "9px",
        // (container width - slider width) - (2 * margin size)
        transform: props.checked ? `translateX(${40 - 18 - 3 * 2}px)` : "",
        // i found this bezier purely by playing about on cubic-bezier.com
        transition: "transform 250ms cubic-bezier(.33,0,.24,1.02)",
        background: "white",
      }}
    >
      <ButtonIcon state={props.checked} />
    </div>
    {/* the actual input: useful for accesibility etc */}
    <input
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        position: "absolute",
        margin: 0,
        opacity: 0,
        cursor: "pointer",
      }}
      type="checkbox"
      tabindex="0"
      checked={props.checked}
      disabled={props.disabled}
      onchange={() => props.onChange(!props.checked)}
    />
  </div>
);