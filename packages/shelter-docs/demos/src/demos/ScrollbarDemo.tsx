import { Text, niceScrollbarsClass } from "@uwu/shelter-ui";

export default function ScrollbarDemo() {
  return (
    <div
      class={niceScrollbarsClass()}
      style={{
        height: "150px",
        overflow: "auto",
        padding: "8px",
        border: "1px solid var(--border-subtle)",
        "border-radius": "var(--radius-md)",
        background: "var(--input-background-default)",
      }}
    >
      <Text>Scroll down for a secret</Text>
      <div style={{ height: "300px", display: "flex", "align-items": "end" }}>
        <Text>:3</Text>
      </div>
    </div>
  );
}
