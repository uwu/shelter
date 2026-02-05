import { Text, TextTags } from "@uwu/shelter-ui";

export default function TextVariantsDemo() {
  return (
    <div style={{ display: "flex", "flex-direction": "column", gap: "8px" }}>
      <Text tag={TextTags.textXXS}>textXXS</Text>
      <Text tag={TextTags.textXS}>textXS</Text>
      <Text tag={TextTags.textSM}>textSM</Text>
      <Text tag={TextTags.textMD}>textMD (default)</Text>
      <Text tag={TextTags.textLG}>textLG</Text>
      <Text tag={TextTags.messagePreview}>messagePreview</Text>
      <Text tag={TextTags.channelTitle}>channelTitle</Text>
      <Text tag={TextTags.displaySM}>displaySM</Text>
      <Text tag={TextTags.displayMD}>displayMD</Text>
      <Text tag={TextTags.displayLG}>displayLG</Text>
    </div>
  );
}
