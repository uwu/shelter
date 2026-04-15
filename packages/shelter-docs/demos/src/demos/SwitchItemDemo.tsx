import { createSignal } from "solid-js";
import { SwitchItem } from "@uwu/shelter-ui";

export default function SwitchItemDemo() {
  const [checked, setChecked] = createSignal(true);
  return (
    <SwitchItem
      checked={checked()}
      onChange={setChecked}
      hideBorder={true}
      note="This is a helpful description of the option"
    >
      A Cool Option
    </SwitchItem>
  );
}
