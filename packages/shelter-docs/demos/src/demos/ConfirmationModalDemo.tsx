import { createSignal } from "solid-js";
import { Button, ButtonColors, ButtonSizes, Text, openConfirmationModal } from "@uwu/shelter-ui";

export default function ConfirmationModalDemo() {
  const [result, setResult] = createSignal<string | null>(null);

  const handleOpen = () => {
    setResult(null);
    openConfirmationModal({
      header: () => "Are you sure????",
      body: () => "Really destroy your entire hard disk? You sure? What?",
      type: "danger",
      confirmText: "Yes, really.",
      cancelText: "Oh shoot!",
    }).then(
      () => setResult("Confirmed!"),
      () => setResult("Cancelled"),
    );
  };

  return (
    <div style={{ display: "flex", "flex-direction": "column", gap: "12px" }}>
      <Button
        color={ButtonColors.CRITICAL_PRIMARY}
        size={ButtonSizes.MEDIUM}
        onClick={handleOpen}
        style={{ width: "180px" }}
      >
        Open Confirmation Modal
      </Button>
      {result() && <Text>Result: {result()}</Text>}
    </div>
  );
}
