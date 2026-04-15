import { createSignal } from "solid-js";
import { Slider } from "@uwu/shelter-ui";

export default function SliderDemo() {
  const [value, setValue] = createSignal(5);

  return (
    <div style={{ width: "100%" }}>
      <Slider min={0} max={10} step={1} tick value={value()} onInput={setValue} />
    </div>
  );
}
