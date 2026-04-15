import { createSignal, Show } from "solid-js";
import { Button, ButtonColors, Text, ErrorBoundary, ButtonSizes } from "@uwu/shelter-ui";

function BrokenComponent() {
  throw new Error("This incident will be reported.");
  return <div></div>;
}

export default function ErrorBoundaryDemo() {
  const [showBroken, setShowBroken] = createSignal(false);

  return (
    <div style={{ display: "flex", "flex-direction": "column", gap: "12px" }}>
      <Button color={ButtonColors.CRITICAL_PRIMARY} size={ButtonSizes.MEDIUM} onClick={() => setShowBroken(true)}>
        Trigger Error
      </Button>
      <ErrorBoundary>
        <Show when={showBroken()} fallback={<Text>Click the break the component.</Text>}>
          <BrokenComponent />
        </Show>
      </ErrorBoundary>
    </div>
  );
}
