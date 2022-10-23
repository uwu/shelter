import { Component, createEffect, createMemo, createSignal } from "solid-js";
import { classes, css } from "./modals.tsx.scss";
import { injectCss } from "./util";
import { render } from "solid-js/web";

type ModalProps = { close(): void };

const [currentModals, setCurrentModals] = createSignal<Component<ModalProps>[]>([]);
let dispose: () => void;

let cssInjected = false;

const ModalRoot: Component = () => {
  if (!cssInjected) {
    injectCss(css);
    cssInjected = true;
  }

  const modalCount = createMemo(() => currentModals().length);

  return (
    <>
      <div class={classes.bg} onclick={popModal} />

      {currentModals() && console.log("modals changed")}

      {currentModals().map((M, idx) => {
        console.log("encountered", M);
        return (
          <div
            classList={{
              [classes.wrap]: true,
              [classes.active]: idx === modalCount() - 1,
            }}
          >
            <M close={() => popSpecificModal(M)} />
          </div>
        );
      })}
    </>
  );
};

// modal mounting and unmounting
createEffect(() => {
  if (currentModals().length === 0) {
    dispose?.();
    dispose = undefined;
  } else if (!dispose) {
    const root = (<div class={classes.mroot} aria-modal role="dialog" />) as HTMLDivElement;
    document.body.append(root);
    const disp = render(() => <ModalRoot />, root);
    dispose = () => {
      disp();
      root.remove();
    };
  }
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
