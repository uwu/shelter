import { Text, TextTags, TextWeights } from "../text";
import { classes } from "./index.tsx.scss";
import { type Component, createSignal, onMount, onCleanup } from "solid-js";
import { ToastColors } from "./index";

type ToastProps = {
  title?: string;
  content?: string;
  class?: string;
  color?: string;
  onClick?: () => void;
  duration?: number;
  removeToast: () => void;
};

const Toast: Component<ToastProps> = (props) => {
  const [state, setState] = createSignal<"enter" | "visible" | "exit">("enter");

  onMount(() => {
    requestAnimationFrame(() => setState("visible"));

    if (props.duration !== Number.POSITIVE_INFINITY) {
      const timeout = setTimeout(() => {
        setState("exit");
      }, props.duration ?? 3000);

      onCleanup(() => clearTimeout(timeout));
    }
  });

  const handleClick = () => {
    props.onClick?.();
    setState("exit");
  };

  return (
    <div
      classList={{
        [classes.toastAnimationWrapper]: true,
        [classes.toastEnter]: state() === "enter",
        [classes.toastExit]: state() === "exit",
      }}
      onTransitionEnd={() => {
        if (state() === "exit") {
          props.removeToast();
        }
      }}
    >
      <div onClick={handleClick} class={`${classes.toast} ${props.color ?? ToastColors.INFO} ${props.class ?? ""}`}>
        {props.title && (
          <Text tag={TextTags.textLG} weight={TextWeights.semibold}>
            {props.title}
          </Text>
        )}
        {props.content && (
          <div>
            <Text>{props.content}</Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toast;
