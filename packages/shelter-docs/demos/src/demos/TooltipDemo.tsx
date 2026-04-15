import { Text, IconClose, tooltip } from "@uwu/shelter-ui";

false && tooltip;

export default function TooltipDemo() {
  return (
    <div style={{ display: "flex", gap: "8px", "align-items": "center" }}>
      <button
        use:tooltip="Delete"
        style={{
          background: "var(--input-background-default)",
          border: "1px solid var(--input-border-default)",
          cursor: "pointer",
          padding: "8px 16px",
          "border-radius": "var(--radius-md)",
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
        }}
      >
        <IconClose />
      </button>
      <button
        use:tooltip={[true, "Delete but underneath"]}
        style={{
          background: "var(--input-background-default)",
          border: "1px solid var(--input-border-default)",
          cursor: "pointer",
          padding: "8px 16px",
          "border-radius": "var(--radius-md)",
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
          "margin-right": "6px",
        }}
      >
        <IconClose />
      </button>
      <Text>Try hovering the buttons!</Text>
    </div>
  );
}
