import { type JSX, splitProps } from "solid-js";
import { css, classes } from "./text.tsx.scss";
import { Dynamic } from "solid-js/web";
import { ensureInternalStyle } from "./internalstyles";
import { type NativeExtendingComponent } from "./wrapperTypes";

export const TextTags = {
  textXXS: classes.textXxs,
  textXS: classes.textXs,
  textSM: classes.textSm,
  textMD: classes.textMd,
  textLG: classes.textLg,
  messagePreview: classes.messagePreview,
  channelTitle: classes.channelTitle,
  displaySM: classes.displaySm,
  displayMD: classes.displayMd,
  displayLG: classes.displayLg,
} satisfies Record<string, string>;

export const TextWeights = {
  normal: classes.normal,
  medium: classes.medium,
  semibold: classes.semibold,
  bold: classes.bold,
  extrabold: classes.extrabold,
} satisfies Record<string, string>;

type TextProps = {
  tag?: string;
  weight?: string;
  style?: JSX.CSSProperties;
};

export const Text: NativeExtendingComponent<TextProps, JSX.HTMLAttributes<HTMLSpanElement>> = (props) => {
  ensureInternalStyle(css);

  const [local, headerProps] = splitProps(props, ["tag", "weight", "class", "style"]);

  return (
    <span
      class={`${local.class ?? ""} ${local.tag ?? TextTags.textMD} ${local.weight ?? TextWeights.normal} ${classes.text}`}
      style={{
        ...local.style,
      }}
      {...headerProps}
    />
  );
};
