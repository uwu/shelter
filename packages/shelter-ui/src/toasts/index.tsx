// ported from Cumcord
// https://github.com/Cumcord/Cumcord/blob/f98494df6e7ee781163a7f2a54f3197e92bf73a4/src/api/ui/toasts/index.jsx

import { injectCss } from "../util";
import { classes, css } from "./index.tsx.scss";
import { setToasts, toasts } from "./store";
import { render } from "solid-js/web";
import ToastContainer from "./ToastContainer";
import Toast from "./Toast";

export function initToasts(mountPoint: HTMLElement) {
  const injected = injectCss(css);

  const toastDiv = (<div class={classes.toastcontainer} />) as HTMLDivElement;

  mountPoint.prepend(toastDiv);
  const unmount = render(() => <ToastContainer />, toastDiv);

  return () => {
    unmount();
    toastDiv.remove();
    injected();
  };
}

export function showToast({
  title = undefined,
  content = undefined,
  onClick = () => {},
  class: _class = undefined,
  duration = 3000,
}) {
  const toast = () => <Toast {...{ onClick, class: _class, title, content }} />;

  setToasts([...toasts(), toast]);

  const removeFunc = () => setToasts([...toasts().filter((t) => t !== toast)]);

  if (duration !== Infinity) setTimeout(removeFunc, duration);

  return removeFunc;
}
