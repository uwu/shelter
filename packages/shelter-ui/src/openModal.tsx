import { Component, createEffect, createMemo, createSignal } from "solid-js";
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

  const modalCount = createMemo(() => currentModals().length);

  return (
    <div class={classes.mroot} aria-modal role="dialog">
      <div class={classes.bg} onclick={popModal} />

      {currentModals().map((M, idx) => (
        <div
          classList={{
            [classes.wrap]: true,
            [classes.active]: idx === modalCount() - 1,
          }}
        >
          <M close={() => popSpecificModal(M)} />
        </div>
      ))}
    </div>
  );
});

// modal mounting and unmounting
createEffect(() => {
  if (currentModals().length === 0) {
    modalElem?.remove();
    modalElem = undefined;
  } else if (!modalElem) document.body.append((modalElem = (<ModalRoot />) as HTMLDivElement));
});

function popModal() {
  setCurrentModals(currentModals().slice(0, -1));
}

function popSpecificModal(comp: Component<ModalProps>) {
  setCurrentModals(currentModals().filter((m) => m !== comp));
}

export function openModal(comp: Component<ModalProps>) {
  setCurrentModals([...currentModals(), comp]);

  return () => popSpecificModal(comp);
}
