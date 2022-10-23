import { Component, JSX, onCleanup } from "solid-js";
import { classes } from "./modals.tsx.scss";
import { Header, HeaderTags } from "./header";
import { Button, ButtonColors, ButtonSizes } from "./button";
import { openModal } from "./openModal";

export const ModalSizes = {
  SMALL: classes.sm,
  MEDIUM: classes.md,
};

export const ModalRoot: Component<{
  size?: string;
  children?: JSX.Element;
  class?: string;
  style?: string | JSX.CSSProperties;
}> = (props) => (
  <div
    onclick={(e) => e.stopPropagation()}
    class={`${classes.modal} ${props.size ?? ModalSizes.SMALL} ${props.class ?? ""}`}
    style={props.style}
  >
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

const confirmColours = {
  danger: ButtonColors.RED,
  confirm: ButtonColors.GREEN,
};

type ModalTypes = "neutral" | "danger" | "confirm";

export const ModalConfirmFooter: Component<{
  close(): void;
  confirmText?: string;
  cancelText?: string;
  type?: ModalTypes;
  onConfirm?(): void;
  onCancel?(): void;
}> = (props) => (
  <ModalFooter>
    <div class={classes.confirm}>
      <Button
        size={ButtonSizes.MEDIUM}
        color={ButtonColors.SECONDARY}
        onClick={() => {
          props.onCancel?.();
          props.close();
        }}
      >
        {props.cancelText ?? "Cancel"}
      </Button>
      <Button
        size={ButtonSizes.MEDIUM}
        color={confirmColours[props.type ?? "neutral"]}
        onClick={() => {
          props.onConfirm?.();
          props.close();
        }}
      >
        {props.confirmText ?? "Confirm"}
      </Button>
    </div>
  </ModalFooter>
);

export const openConfirmationModal = ({
  body,
  header,
  confirmText,
  cancelText,
  type,
  size,
}: {
  body?: Component;
  header?: Component;
  confirmText?: string;
  cancelText?: string;
  type?: ModalTypes;
  size?: string;
}) =>
  new Promise<void>((res, rej) => {
    openModal((props) => {
      onCleanup(rej);
      return (
        <ModalRoot size={size}>
          <ModalHeader close={props.close}>{header({})}</ModalHeader>
          <ModalBody>{body({})}</ModalBody>
          <ModalConfirmFooter
            onConfirm={res}
            onCancel={rej}
            close={props.close}
            confirmText={confirmText}
            cancelText={cancelText}
            type={type}
          />
        </ModalRoot>
      );
    });
  });
