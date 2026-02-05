import { Divider, Text } from "@uwu/shelter-ui";

export default function DividerDemo() {
  return (
    <div style={{ width: "100%" }}>
      <Text>Content above</Text>
      <Divider mt mb />
      <Text>Content below</Text>
    </div>
  );
}
