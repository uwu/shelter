import { focusring } from "@uwu/shelter-ui";

false && focusring;

export default function FocusringDemo() {
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <button
        use:focusring
        style={{
          background: "#304050",
          border: "1px solid #80208050",
          "border-radius": "var(--radius-md)",
          padding: "8px 16px",
          cursor: "pointer",
        }}
      >
        Custom button with focusring
      </button>
    </div>
  );
}
