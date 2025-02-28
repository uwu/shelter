import { JSX, mergeProps, splitProps } from "solid-js";
import { injectCss } from "@uwu/shelter-ui";
import { classes, css } from "./Alert.tsx.scss";

type AlertProps = {
  className?: string;
  type: "info" | "success" | "warn" | "danger";
  children: JSX.Element;
};

let injectedCss = false;

export default (props: AlertProps) => {
  if (!injectedCss) {
    injectCss(css);
    injectedCss = true;
  }

  return (
    <div class={[classes.alertBox, props.type ? classes[props.type] : "", props.className].join(" ")} role="alert">
      <blockquote>{props.children}</blockquote>
    </div>
  );
};
