import { For } from "solid-js";
import { Dynamic } from "solid-js/web";
import { toasts } from "./store";

export default () => {
  return <For each={toasts()}>{(toast) => <Dynamic component={toast.component} />}</For>;
};
