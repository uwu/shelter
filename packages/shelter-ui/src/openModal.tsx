import { Component, createEffect, createMemo, createSignal, For } from "solid-js";
import { classes, css } from "./modals.tsx.scss";
import { injectCss } from "./util";
import { render } from "solid-js/web";

type ModalProps = { close(): void };

const [currentModals, setCurrentModals] = createSignal<Component<ModalProps>[]>([]);
let dispose: () => void;

let cssInjected = false;

// dont show modals for one tick after mounting ("pre") to trigger transition
// and hide them 250ms before hiding them ("post") to allow the transition to play out
// this is done in the open and pop functions
const [animationPrePost, setAnimationPrePost] = createSignal(true);

// essentially the same as above but we don't bother with it when swapping between two modals
// this is done in the component and the pop functions
const [bgAnimPrePost, setBgAnimPrePost] = createSignal(true);

const ModalRoot: Component = () => {
  if (!cssInjected) {
    injectCss(css);
    cssInjected = true;
  }

  const modalCount = createMemo(() => currentModals().length);

  // see line 18
  setTimeout(() => setBgAnimPrePost(false));

  return (
    <>
      <div class={classes.bg} style={{ background: bgAnimPrePost() ? "transparent" : "" }} onclick={popModal} />

      <For each={currentModals()}>
        {(M, idx) => (
          <div
            classList={{
              [classes.wrap]: true,
              [classes.active]: idx() === modalCount() - (animationPrePost() ? 2 : 1),
            }}
          >
            <M close={() => popSpecificModal(M)} />
          </div>
        )}
      </For>
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
  // see line 13
  setAnimationPrePost(true);

  // see line 18
  if (currentModals().length === 1) setBgAnimPrePost(true);

  setTimeout(() => {
    setAnimationPrePost(false);
    setCurrentModals(currentModals().slice(0, -1));
  }, 250);
}

function popSpecificModal(comp: Component<ModalProps>) {
  // see line 13
  setAnimationPrePost(true);

  // see line 18
  if (currentModals().length === 1) setBgAnimPrePost(true);

  setTimeout(() => {
    setAnimationPrePost(false);
    setCurrentModals(currentModals().filter((m) => m !== comp));
  }, 250);
}

export function openModal(comp: Component<ModalProps>) {
  // see line 13
  setAnimationPrePost(true);
  setCurrentModals([...currentModals(), comp]);
  setTimeout(() => setAnimationPrePost(false));

  return () => popSpecificModal(comp);
}
