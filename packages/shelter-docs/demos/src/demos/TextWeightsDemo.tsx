import { Text, TextWeights } from "@uwu/shelter-ui";

export default function TextWeightsDemo() {
  return (
    <div style={{ display: "flex", "flex-direction": "column", gap: "4px" }}>
      <Text weight={TextWeights.normal}>Normal (400)</Text>
      <Text weight={TextWeights.medium}>Medium (500)</Text>
      <Text weight={TextWeights.semibold}>Semibold (600)</Text>
      <Text weight={TextWeights.bold}>Bold (700)</Text>
      <Text weight={TextWeights.extrabold}>Extrabold (800)</Text>
    </div>
  );
}
