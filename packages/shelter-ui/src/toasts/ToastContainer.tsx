import { toasts } from "./store";
import { Dynamic } from "solid-js/web";

export default () => (
  <>
    {toasts().map((t) => (
      <Dynamic component={t} />
    ))}
  </>
);
