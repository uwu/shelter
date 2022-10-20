import { Component, JSX } from "solid-js";
import { classes } from "./modals.tsx.scss";
import { Header, HeaderTags } from "./header";

export const ModalSizes = {
  SMALL: classes.sm,
  MEDIUM: classes.md,
};

export const ModalRoot: Component<{
  size?: string;
  children?: JSX.Element;
}> = (props) => (
  <div onclick={(e) => e.stopPropagation()} class={`${classes.modal} ${props.size ?? ModalSizes.SMALL}`}>
    {props.children}
  </div>
);

export const ModalFooter: Component<{ children?: JSX.Element }> = (props) => (
  <div class={classes.foot}>{props.children}</div>
);

export const ModalHeader: Component<{
  noClose?: boolean;
  children?: JSX.Element;
  close(): void;
}> = (props) => (
  <div class={classes.head}>
    <Header tag={HeaderTags.H1}>{props.children}</Header>

    <button class={classes.cbtn} style={{ display: props.noClose ? "none" : "" }} onclick={props.close}>
      <svg role="img" width="24" height="24" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"
        />
      </svg>
    </button>
  </div>
);

export const ModalBody: Component<{ children?: JSX.Element }> = (props) => (
  <div class={classes.body}>{props.children}</div>
);
