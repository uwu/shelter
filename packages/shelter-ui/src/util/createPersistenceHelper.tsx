// a utility component that re-runs the function it wraps when the component it injects is removed from the DOM

import { onCleanup } from "solid-js";
import { ReactiveRoot } from "./ReactiveRoot";

export function createPersistenceHelper<T>(func: (PersistenceHelper: () => HTMLElement) => T) {
  let isCancelled = false;

  let onlyOne = false;

  function PersistenceHelperInner() {
    onCleanup(() => {
      if (isCancelled || onlyOne) return;

      onlyOne = true;

      queueMicrotask(() => {
        console.warn("[Persistence helper] Fired, reinjecting");

        func(PersistenceHelperOuter);

        onlyOne = false;
      });
    });

    return <></>;
  }

  function PersistenceHelperOuter() {
    return (
      <ReactiveRoot>
        <PersistenceHelperInner />
      </ReactiveRoot>
    ) as HTMLElement;
  }

  const wrapped = () => func(PersistenceHelperOuter);

  wrapped.cancel = () => {
    isCancelled = true;
  };

  return wrapped as { (): T; cancel(): void };
}
