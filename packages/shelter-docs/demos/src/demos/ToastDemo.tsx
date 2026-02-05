import { Button, ButtonColors, showToast, ToastColors } from "@uwu/shelter-ui";

export default function ToastDemo() {
  return (
    <div style={{ display: "flex", gap: "8px", "flex-wrap": "wrap" }}>
      <Button
        color={ButtonColors.PRIMARY}
        onClick={() =>
          showToast({
            title: "Info Toast",
            content: "This is the default toast style",
            color: ToastColors.INFO,
          })
        }
      >
        Info
      </Button>
      <Button
        color={ButtonColors.ACTIVE}
        onClick={() =>
          showToast({
            title: "Success Toast",
            content: "Button clicked successfully. Good job!",
            color: ToastColors.SUCCESS,
          })
        }
      >
        Success
      </Button>
      <Button
        color={ButtonColors.SECONDARY}
        onClick={() =>
          showToast({
            title: "Warning Toast",
            content: "Something went wrong, but we can still recover",
            color: ToastColors.WARNING,
          })
        }
      >
        Warning
      </Button>
      <Button
        color={ButtonColors.CRITICAL_PRIMARY}
        onClick={() =>
          showToast({
            title: "Critical Toast",
            content: "Use this when you have a fucky wucky",
            color: ToastColors.CRITICAL,
          })
        }
      >
        Critical
      </Button>
    </div>
  );
}
