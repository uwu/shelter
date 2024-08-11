import { type Component, createEffect, createSignal, For } from "solid-js";
import { classes, css } from "./modals.tsx.scss";
import { ReactiveRoot } from "./util";
import { ensureInternalStyle } from "./internalstyles";
import { ErrorBoundary } from "./errorboundary";

type ModalProps = { close(): void };

const [currentModals, setCurrentModals] = createSignal<Component<ModalProps>[]>([]);
let dispose: () => void;

// dont show modals for one tick after mounting ("pre") to trigger transition
// and hide them 250ms before hiding them ("post") to allow the transition to play out
// this is done in the open and pop functions
const [animationPrePost, setAnimationPrePost] = createSignal(true);

// essentially the same as above but we don't bother with it when swapping between two modals
// this is done in the component and the pop functions
const [bgAnimPrePost, setBgAnimPrePost] = createSignal(true);

const ModalRoot: Component = () => {
  ensureInternalStyle(css);

  let dialogEl;
  let backdropEl;

  createEffect(() => {
    dialogEl.showModal();
    setBgAnimPrePost(false);

    dialogEl.addEventListener("cancel", (ev) => {
      ev.preventDefault(); // not ideal but sure
      popModal();
    });

    // stop discord layers closing
    dialogEl.addEventListener("keydown", (ev) => ev.stopImmediatePropagation());

    // click outside dialog handler
    backdropEl.addEventListener("click", popModal);
  });

  return (
    <ReactiveRoot>
      <dialog
        ref={dialogEl}
        classList={{
          [classes.mroot]: true,
          [classes.active]: !bgAnimPrePost(),
        }}
      >
        <div ref={backdropEl} class={classes.backdrop} />
        <For each={currentModals()}>
          {(M, idx) => (
            <div
              classList={{
                [classes.wrap]: true,
                [classes.active]: idx() === currentModals().length - (animationPrePost() ? 2 : 1),
              }}
            >
              <ErrorBoundary>
                <M close={() => popSpecificModal(M)} />
              </ErrorBoundary>
            </div>
          )}
        </For>
      </dialog>
    </ReactiveRoot>
  );
};

// modal mounting and unmounting
createEffect(() => {
  if (currentModals().length === 0) {
    dispose?.();
    dispose = undefined;
  } else if (!dispose) {
    const root = (<ModalRoot />) as HTMLDialogElement;
    root.classList.add("shltr-modal-rroot");

    document.body.append(root);
    dispose = () => root.remove();
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
