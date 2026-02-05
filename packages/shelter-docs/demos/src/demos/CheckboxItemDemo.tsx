import { createSignal } from "solid-js";
import { CheckboxItem } from "@uwu/shelter-ui";

export default function CheckboxItemDemo() {
  const [checked, setChecked] = createSignal(true);
  return (
    <CheckboxItem checked={checked()} onChange={setChecked}>
      Accept terms and conditions
    </CheckboxItem>
  );
}
