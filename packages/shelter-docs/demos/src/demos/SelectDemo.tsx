import { createSignal } from "solid-js";
import { Select, SelectOption, Text } from "@uwu/shelter-ui";

export default function SelectDemo() {
  const [value, setValue] = createSignal<string | null>(null);

  return (
    <div style={{ display: "flex", "flex-direction": "column", gap: "16px", width: "100%" }}>
      <Text>Selected: {value() ?? "none"}</Text>
      <Select value={value() ?? undefined} onChange={setValue} placeholder="Pick a fruit">
        <SelectOption value="apple">Apple</SelectOption>
        <SelectOption value="banana">Banana</SelectOption>
        <SelectOption value="orange">Orange</SelectOption>
        <SelectOption value="pear" disabled>
          Pear (disabled)
        </SelectOption>
      </Select>
    </div>
  );
}
