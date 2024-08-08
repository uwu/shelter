import { Component, JSX, splitProps } from "solid-js";
import { css, classes } from "./header.tsx.scss";
import { Dynamic } from "solid-js/web";
import { ensureInternalStyle } from "./internalstyles";

export const HeaderTags: Record<string, string> = {
  H1: classes.h1,
  H2: classes.h2,
  H3: classes.h3,
  H4: classes.h4,
  H5: classes.h5,
};

type HeaderProps = {
  tag: string;
};

export const Header: Component<HeaderProps & JSX.HTMLAttributes<HTMLHeadingElement>> = (props) => {
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
