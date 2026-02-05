import { Text, TextWeights, ModalConfirmFooter } from "@uwu/shelter-ui";

export default function ConfirmFooterDemo() {
  return (
    <div style={{ display: "flex", "flex-direction": "column", gap: "12px" }}>
      <style>{"[class*=foot] { display: flex; flex-direction: row; gap: 8px; }"}</style>
      <Text weight={TextWeights.semibold}>Neutral:</Text>
      <ModalConfirmFooter close={() => {}} type="neutral" />
      <Text weight={TextWeights.semibold}>Danger:</Text>
      <ModalConfirmFooter close={() => {}} type="danger" />
      <Text weight={TextWeights.semibold}>Confirm:</Text>
      <ModalConfirmFooter close={() => {}} type="confirm" />
    </div>
  );
}
