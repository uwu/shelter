import { createSignal } from "solid-js";
import { TextArea } from "@uwu/shelter-ui";

export default function TextareaDemo() {
  const [value, setValue] = createSignal("");
  return (
    <TextArea
      placeholder="Type a longer message..."
      value={value()}
      onInput={setValue}
      resize-y
      counter={true}
      style={{ width: "100%", "min-height": "100px" }}
    />
  );
}
