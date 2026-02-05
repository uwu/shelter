import { createSignal } from "solid-js";
import { Switch, Text } from "@uwu/shelter-ui";

export default function SwitchDemo() {
  const [checked, setChecked] = createSignal(false);
  return (
    <div style={{ display: "flex", gap: "16px", "align-items": "center" }}>
      <Switch checked={checked()} onChange={setChecked} />
      <Text>{checked() ? "On" : "Off"}</Text>
    </div>
  );
}
