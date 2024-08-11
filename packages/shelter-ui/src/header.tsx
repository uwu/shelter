import { type JSX, splitProps } from "solid-js";
import { css, classes } from "./header.tsx.scss";
import { Dynamic } from "solid-js/web";
import { ensureInternalStyle } from "./internalstyles";
import { type NativeExtendingComponent } from "./wrapperTypes";

export const HeaderTags = {
  H1: classes.h1,
  H2: classes.h2,
  H3: classes.h3,
  H4: classes.h4,
  H5: classes.h5,
} satisfies Record<string, string>;

type HeaderProps = {
  tag: string;
};
export const Header: NativeExtendingComponent<HeaderProps, JSX.HTMLAttributes<HTMLHeadingElement>> = (props) => {
  ensureInternalStyle(css);

  const [local, headerProps] = splitProps(props, ["tag", "class"]);

  return (
    <Dynamic
      component={local.tag === HeaderTags.H5 ? "h3" : "h2"}
      class={`${local.class ?? ""} ${local.tag ?? HeaderTags.H5} ${classes.h}`}
      {...headerProps}
    />
  );
};
