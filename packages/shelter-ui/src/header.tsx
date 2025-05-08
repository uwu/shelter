import { type JSX, splitProps } from "solid-js";
import { css, classes } from "./header.tsx.scss";
import { Dynamic } from "solid-js/web";
import { ensureInternalStyle } from "./internalstyles";
import { type NativeExtendingComponent } from "./wrapperTypes";

export const HeaderTags = {
  HeadingXXL: classes.h1,
  HeadingXL: classes.h2,
  HeadingLG: classes.h3,
  HeadingMD: classes.h4,
  HeadingSM: classes.h5,
  // Aliases of heading-xxl, heading-xl, heading-lg, heading-md, heading-sm for backwards compatibility
  H1: classes.h1,
  H2: classes.h2,
  H3: classes.h3,
  H4: classes.h4,
  H5: classes.h5,
  EYEBROW: classes.eyebrow,
} satisfies Record<string, string>;

export const HeaderWeights = {
  normal: classes.normal,
  medium: classes.medium,
  semibold: classes.semibold,
  bold: classes.bold,
  extrabold: classes.extrabold,
} satisfies Record<string, string>;

type HeaderProps = {
  tag: string;
  weight?: string;
  margin?: boolean;
};

export const Header: NativeExtendingComponent<HeaderProps, JSX.HTMLAttributes<HTMLHeadingElement>> = (props) => {
  ensureInternalStyle(css);

  const [local, headerProps] = splitProps(props, ["tag", "weight", "class", "margin"]);

  return (
    <Dynamic
      component={[HeaderTags.H5, HeaderTags.EYEBROW].includes(local.tag) ? "h3" : "h2"}
      class={`${local.class ?? ""} ${local.tag ?? HeaderTags.H3} ${local.weight ?? HeaderWeights.semibold} ${classes.h} ${local.margin !== false ? classes.margin : ""}`}
      {...headerProps}
    />
  );
};
