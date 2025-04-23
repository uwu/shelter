import { type JSX, splitProps } from "solid-js";
import { css, classes } from "./text.tsx.scss";
import { Dynamic } from "solid-js/web";
import { ensureInternalStyle } from "./internalstyles";
import { type NativeExtendingComponent } from "./wrapperTypes";

export const TextTags = {
  textXXS: classes.textXXS,
  textXS: classes.textXS,
  textSM: classes.textSM,
  textMD: classes.textMD,
  textLG: classes.textLG,
  messagePreview: classes.messagePreview,
  channelTitle: classes.channelTitle,
  displaySM: classes.displaySM,
  displayMD: classes.displayMD,
  displayLG: classes.displayLG,
} satisfies Record<string, string>;

export const TextWeights = {
  normal: classes.normal,
  medium: classes.medium,
  semibold: classes.semibold,
  bold: classes.bold,
  extrabold: classes.extrabold,
} satisfies Record<string, string>;

type TextProps = {
  tag: string;
  weight?: string;
};

export const Text: NativeExtendingComponent<TextProps, JSX.HTMLAttributes<HTMLHeadingElement>> = (props) => {
  ensureInternalStyle(css);

  const [local, headerProps] = splitProps(props, ["tag", "weight", "class"]);

  return (
    <p
      class={`${local.class ?? ""} ${local.tag ?? TextTags.textMD} ${local.weight ?? TextWeights.normal} ${classes.p}`}
      {...headerProps}
    />
  );
};
