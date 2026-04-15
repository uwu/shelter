import { createSignal } from "solid-js";
import { Checkbox, Text } from "@uwu/shelter-ui";

export default function CheckboxDemo() {
  const [checked, setChecked] = createSignal(false);
  return (
    <div style={{ display: "flex", gap: "16px", "align-items": "center" }}>
      <Checkbox checked={checked()} onChange={setChecked} />
      <Text>{checked() ? "Checked" : "Unchecked"}</Text>
    </div>
  );
}
