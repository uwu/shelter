import { createSignal } from "solid-js";
import { TextBox } from "@uwu/shelter-ui";

export default function TextboxDemo() {
  const [value, setValue] = createSignal("");
  return <TextBox placeholder="Type something..." value={value()} onInput={setValue} />;
}
