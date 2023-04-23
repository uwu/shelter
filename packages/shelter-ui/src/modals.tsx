import { Component, JSX, onCleanup } from "solid-js";
import { classes } from "./modals.tsx.scss";
import { Header, HeaderTags } from "./header";
import { Button, ButtonColors, ButtonSizes } from "./button";
import { openModal } from "./openModal";
import { IconClose } from "./icons";
import { focusring } from "./focusring";
false && focusring;

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

    <button
      use:focusring
      aria-label="close modal"
      class={classes.cbtn}
      style={{ display: props.noClose ? "none" : "" }}
      onclick={props.close}
    >
      <IconClose />
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
  disabled?: boolean;
  cancelDisabled?: boolean;
}> = (props) => (
  <ModalFooter>
    <div class={classes.confirm}>
      <Button
        disabled={props.cancelDisabled}
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
        disabled={props.disabled}
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
