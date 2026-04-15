import { Button, ButtonColors, ButtonSizes } from "@uwu/shelter-ui";

export default function ButtonColorsDemo() {
  return (
    <div style={{ display: "flex", gap: "8px", "flex-wrap": "wrap" }}>
      <Button color={ButtonColors.PRIMARY} size={ButtonSizes.MEDIUM}>
        Primary
      </Button>
      <Button color={ButtonColors.SECONDARY} size={ButtonSizes.MEDIUM}>
        Secondary
      </Button>
      <Button color={ButtonColors.CRITICAL_PRIMARY} size={ButtonSizes.MEDIUM}>
        Critical
      </Button>
      <Button color={ButtonColors.CRITICAL_SECONDARY} size={ButtonSizes.MEDIUM} style={{ width: "130px" }}>
        Critical Secondary
      </Button>
      <Button color={ButtonColors.ACTIVE} size={ButtonSizes.MEDIUM}>
        Active
      </Button>
    </div>
  );
}
