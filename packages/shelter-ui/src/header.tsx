import { Component, JSX } from "solid-js";
import { injectCss } from "./util";
import { css, classes } from "./header.tsx.scss";
import { Dynamic } from "solid-js/web";

let injectedCss = false;

export const HeaderTags: Record<string, string> = {
  H1: classes.h1,
  H2: classes.h2,
  H3: classes.h3,
  H4: classes.h4,
  H5: classes.h5,
};

export const Header: Component<{ tag: string; children: JSX.Element; class?: string; id?: string }> = (props) => {
  if (!injectedCss) {
    injectCss(css);
    injectedCss = true;
  }

  return (
    <Dynamic
      component={props.tag === HeaderTags.H5 ? "h3" : "h2"}
      class={props.class}
      id={props.id}
      classList={{
        [props.tag ?? HeaderTags.H5]: true,
        [classes.h]: true,
      }}
    >
      {props.children}
    </Dynamic>
  );
};
