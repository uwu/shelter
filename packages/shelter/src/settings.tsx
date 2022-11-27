// Injects a section into user settings

import { getDispatcher } from "./flux";
import { awaitDispatch, getFiber, reactFiberWalker } from "./util";
import { Component, createSignal, onCleanup } from "solid-js";
import { SolidInReactBridge } from "shelter-ui";
import Settings from "./components/Settings";
import { after } from "spitroast";

type SettingsSection =
  | ["divider"]
  | ["header", string]
  | ["section", string, string, Component]
  | ["button", string, string, () => void];

const injectedSections: SettingsSection[] = [
  ["divider"],
  ["header", "Shelter"],
  ["section", "settings", "Settings", Settings],
];

const generatePredicateSections = () =>
  injectedSections.map((s) => {
    switch (s[0]) {
      case "divider":
        return { section: "DIVIDER" };
      case "header":
        return { section: "HEADER", label: s[1] };
      case "button":
        return { section: s[1], label: s[2], onClick: s[3] };

      case "section":
        return {
          section: s[1],
          label: s[2],
          element: () => <SolidInReactBridge comp={s[3]} />,
        };
    }
  });

const SettingsInj: Component<{
  dividerClasses: string;
  headerClasses: string;
  tabClasses: string;
  mainSection: Element;
  content: Component;
  dispatcher: any;
}> = (props) => {
  const [settingsOpen, setSettingsOpen] = createSignal<[HTMLDivElement, Element] | undefined>();

  // when we are clicked, we hide discord's settings page and insert our own
  // when we detect a set_section dispatch, we re-show discord's settings page and remove our own.
  // TODO: hide the selected style from Discord's tab
  // TODO: support more than one tab

  const cb = () => {
    if (!settingsOpen()) return;
    const [theirDiv, ourDiv] = settingsOpen();
    setSettingsOpen();

    ourDiv.remove();
    theirDiv.style.display = "";
  };

  props.dispatcher.subscribe("USER_SETTINGS_MODAL_SET_SECTION", cb);
  onCleanup(() => props.dispatcher.unsubscribe("USER_SETTINGS_MODAL_SET_SECTION", cb));

  return (
    <div style="display: contents">
      <div class={props.dividerClasses} />
      <div class={props.headerClasses} role="button" tabIndex="-1">
        Shelter
      </div>
      <div
        class={props.tabClasses}
        role="tab"
        aria-selected={!!settingsOpen()}
        aria-disabled={false}
        tabIndex="-1"
        aria-label="Shelter Settings"
        style={{
          background: settingsOpen() ? "var(--background-modifier-selected)" : "",
        }}
        onclick={() => {
          if (settingsOpen()) return;
          const theirDiv = props.mainSection.firstElementChild as HTMLDivElement;
          const ourDiv = (<div style="display: contents">{props.content({})}</div>) as Element;

          setSettingsOpen([theirDiv, ourDiv]);

          theirDiv.style.display = "none";
          props.mainSection.append(ourDiv);
        }}
      >
        Settings
      </div>
    </div>
  );
};

export async function initSettings() {
  const FluxDispatcher = await getDispatcher();

  let firstDispatch = true;
  let canceled = false;
  let unpatch;

  const cb = async () => {
    // wait for lazy loading on initial user settings open
    if (firstDispatch) {
      await awaitDispatch("USER_PROFILE_FETCH_SUCCESS");
      firstDispatch = false;
    }

    // I <3 async
    if (canceled) return;

    // microtask is necessary to allow react to finish rendering the ui before we run
    queueMicrotask(() => {
      const sidebar = document.querySelector("nav > [role=tablist]");
      if (!sidebar) return;

      const f = reactFiberWalker(
        getFiber(sidebar),
        (node) => typeof node?.type === "function" && node.type.prototype.getPredicateSections,
        true
      );

      if (typeof f?.type !== "function") return;

      unpatch = after("getPredicateSections", f.type.prototype, (args, ret: any[]) => {
        const changelogIdx = ret.findIndex((s) => s.section === "changelog");
        if (changelogIdx === -1) return;

        // -1 to go ahead of the divider above it
        ret.splice(changelogIdx - 1, 0, ...generatePredicateSections());
      });

      // trigger rerender for first load by clicking selected section
      const sbarView = reactFiberWalker(getFiber(sidebar), (node) => typeof node.type === "string")?.stateNode;

      if (sbarView instanceof Element) (sbarView.querySelector("[class*=selected]") as HTMLElement)?.click();

      FluxDispatcher.unsubscribe("USER_SETTINGS_MODAL_OPEN", cb);
    });
  };

  FluxDispatcher.subscribe("USER_SETTINGS_MODAL_OPEN", cb);

  return () => {
    FluxDispatcher.unsubscribe("USER_SETTINGS_MODAL_OPEN", cb);
    canceled = true;
    unpatch?.();
  };
}
