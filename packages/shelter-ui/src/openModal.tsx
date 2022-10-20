import { Component, createSignal } from "solid-js";
import { classes, css } from "./modals.tsx.scss";
import { injectCss, withCleanup } from "./util";

type ModalProps = { close(): void };

const [currentModals, setCurrentModals] = createSignal<Component<ModalProps>[]>([]);
let modalElem: HTMLDivElement;

let cssInjected = false;

const ModalRoot: Component = withCleanup(() => {
  if (!cssInjected) {
    injectCss(css);
    cssInjected = true;
  }

  const currentModal = () => currentModals()[0];

  return (
    <div class={classes.mroot} onclick={popModal} aria-modal role="dialog">
      {currentModal()?.({ close: popModal })}
    </div>
  );
});

const mountModal = () => document.body.append((modalElem = (<ModalRoot />) as HTMLDivElement));

function unmountModal() {
  modalElem?.remove();
  modalElem = undefined;
}

function popModal() {
  const modalCount = currentModals().length;

  setCurrentModals(currentModals().slice(1));
  if (modalCount === 1) unmountModal();
}

const popSpecificModal = (comp: Component<ModalProps>) => setCurrentModals(currentModals().filter((m) => m !== comp));

export function openModal(comp: Component<ModalProps>) {
  const modalCount = currentModals().length;
  setCurrentModals([comp, ...currentModals()]);
  if (modalCount === 0) mountModal();

  return () => popSpecificModal(comp);
}
