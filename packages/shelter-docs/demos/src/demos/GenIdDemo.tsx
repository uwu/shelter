import { createSignal } from "solid-js";
import { TextTags, Text, Button, genId } from "@uwu/shelter-ui";

export default function GenIdDemo() {
  const [id, setId] = createSignal(genId());

  return (
    <div style={{ display: "flex", "flex-direction": "column", gap: "8px" }}>
      <Button onClick={() => setId(genId())}>Reroll</Button>
      <Text tag={TextTags.textSM} style={{ opacity: 0.75 }}>
        Generated ID: {id}
      </Text>
    </div>
  );
}
