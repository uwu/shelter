import { createResource, onCleanup, onMount } from "solid-js";

const [demosModule] = createResource(() => import("../../demos/src/index.tsx"));

export interface ShelterDemoProps {
  demo: string;
  margin?: string;
}

function ShelterDemoInner(props: ShelterDemoProps) {
  const { mountDemo } = demosModule()!;

  let div: HTMLDivElement | undefined;

  let dispose: () => void | undefined;
  onMount(() => {
    dispose = mountDemo(props.demo, div!);
  });

  onCleanup(() => dispose?.());

  return (
    <div
      ref={div}
      class="shelter-demo"
      style={{
        padding: "1rem",
        "margin-top": props.margin ?? "1rem",
        "border-radius": "8px",
        "background-color": "var(--background-surface-high)",
        border: "1px solid var(--border-subtle)",
      }}
    />
  );
}

// load bearing fragment
export default (props: ShelterDemoProps) => <>{demosModule.loading ? <></> : <ShelterDemoInner {...props} />}</>;
