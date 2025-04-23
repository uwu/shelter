// ported from Cumcord
// https://github.com/Cumcord/Cumcord/blob/f98494df6e7ee781163a7f2a54f3197e92bf73a4/src/api/ui/toasts/index.jsx

import { injectCss } from "../util";
import { classes, css } from "./index.tsx.scss";
import { removeToast, setToasts, toasts } from "./store";
import { render } from "solid-js/web";
import ToastContainer from "./ToastContainer";
import Toast from "./Toast";
import { genId } from "../util";

export const ToastColors = {
  INFO: classes.info,
  SUCCESS: classes.success,
  WARNING: classes.warning,
  CRITICAL: classes.critical,
} satisfies Record<string, string>;

export function initToasts(mountPoint: HTMLElement) {
  const injected = injectCss(css);

  const toastDiv = (<div class={classes.toastContainer} />) as HTMLDivElement;

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
  color = ToastColors.INFO,
  onClick = () => {},
  class: _class = undefined,
  duration = 3000,
}) {
  const id = genId();
  const removeFn = () => removeToast(id);

  const toastComponent = () => (
    <Toast {...{ onClick, class: _class, title, content, color, duration, removeToast: removeFn }} />
  );

  setToasts([
    ...toasts(),
    {
      id,
      component: toastComponent,
    },
  ]);

  return removeFn;
}
