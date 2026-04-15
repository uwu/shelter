import { Button, ButtonSizes } from "@uwu/shelter-ui";

export default function ButtonSizesDemo() {
  return (
    <div style={{ display: "flex", gap: "8px", "flex-wrap": "wrap", "align-items": "center" }}>
      <Button size={ButtonSizes.TINY}>Tiny</Button>
      <Button size={ButtonSizes.SMALL}>Small</Button>
      <Button size={ButtonSizes.MEDIUM}>Medium</Button>
      <Button size={ButtonSizes.LARGE}>Large</Button>
      <Button size={ButtonSizes.XLARGE}>XLarge</Button>
    </div>
  );
}
