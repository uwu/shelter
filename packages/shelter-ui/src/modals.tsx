import { type Component, type JSX, onCleanup } from "solid-js";
import { classes } from "./modals.tsx.scss";
import { Header, HeaderTags } from "./header";
import { Button, ButtonColors, ButtonLooks, ButtonSizes } from "./button";
import { openModal } from "./openModal";
import { IconClose } from "./icons";
import { focusring } from "./focusring";
import { tooltip } from "./tooltip";
false && focusring;
false && tooltip;

export const ModalSizes = {
  SMALL: classes.sm,
  MEDIUM: classes.md,
  LARGE: classes.lg,
  DYNAMIC: classes.dynamic,
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
    <Header tag={HeaderTags.H2}>{props.children}</Header>
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
    <Button
      grow
      disabled={props.cancelDisabled}
      size={ButtonSizes.MEDIUM}
      color={ButtonColors.PRIMARY}
      onClick={() => {
        props.onCancel?.();
        props.close();
      }}
    >
      {props.cancelText ?? "Cancel"}
    </Button>
    <Button
      grow
      disabled={props.disabled}
      size={ButtonSizes.MEDIUM}
      color={confirmColours[props.type ?? "confirm"]}
      onClick={() => {
        props.onConfirm?.();
        props.close();
      }}
    >
      {props.confirmText ?? "Confirm"}
    </Button>
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
