import { Header, HeaderTags } from "@uwu/shelter-ui";

export default function HeadersDemo() {
  return (
    <div style={{ display: "flex", "flex-direction": "column", gap: "8px" }}>
      <Header tag={HeaderTags.HeadingXXL}>HeadingXXL</Header>
      <Header tag={HeaderTags.HeadingXL}>HeadingXL</Header>
      <Header tag={HeaderTags.HeadingLG}>HeadingLG</Header>
      <Header tag={HeaderTags.HeadingMD}>HeadingMD</Header>
      <Header tag={HeaderTags.HeadingSM}>HeadingSM</Header>
      <Header tag={HeaderTags.EYEBROW}>EYEBROW</Header>
    </div>
  );
}
