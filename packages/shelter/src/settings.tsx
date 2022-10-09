// Injects a section into user settings

import getDispatcher from "./getDispatcher";
import { awaitDispatch, getFiber, reactFiberWalker } from "./util";
import { Component, createSignal, JSX } from "solid-js";
import { Button, ButtonColors } from "shelter-ui";

const SettingsInj: Component<{
  dividerClasses: string;
  headerClasses: string;
  tabClasses: string;
  mainSection: Element;
  content: JSX.Element;
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
  const cleanup = () => props.dispatcher.unsubscribe("USER_SETTINGS_MODAL_SET_SECTION", cb);

  const div = (
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
        aria-label="Test tab"
        style={{
          background: settingsOpen() ? "var(--background-modifier-selected)" : "",
        }}
        onclick={() => {
          if (settingsOpen()) return;
          const theirDiv = props.mainSection.firstElementChild as HTMLDivElement;
          const ourDiv = (<div style="display: contents">{props.content}</div>) as Element;

          setSettingsOpen([theirDiv, ourDiv]);

          theirDiv.style.display = "none"
          props.mainSection.append(ourDiv);
        }}
      >
        Test tab
      </div>
    </div>
  );

  // this is bad and deprecated and ew but 'cause we're not in a real solid app we can't use onCleanup :( -- sink
  (div as Element).addEventListener("DOMNodeRemovedFromDocument", cleanup);

  return div;
};

export async function initSettings() {
  const FluxDispatcher = await getDispatcher();

  let firstDispatch = true;
  let canceled = false;

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
      const mainSection = document.querySelector("[role=tabpanel]");
      if (!sidebar || !mainSection) return;

      const changelogIdx = [...sidebar.children].findIndex(
        (c) => reactFiberWalker(getFiber(c), "id", true)?.pendingProps?.id === "changelog"
      );
      if (changelogIdx === -1) return;

      // indexes are kinda fucky so idk?
      const dividerAboveChangelog = sidebar.children[changelogIdx];

      const tabClasses = sidebar.children[changelogIdx + 1].className;
      const dividerClasses = dividerAboveChangelog.className;
      const headerClasses = sidebar.firstElementChild.className;

      const content = (
        <>
          {Object.values(ButtonColors).map((c) => (
            <div style="display:flex; gap:1rem">
              {[0, 1, 2, 3].map((l) => (
                <Button look={l} color={c}>
                  test
                </Button>
              ))}
            </div>
          ))}
        </>
      );

      const injection = (
        <SettingsInj
          {...{ dividerClasses, headerClasses, tabClasses, mainSection }}
          dispatcher={FluxDispatcher}
          content={content}
        />
      );

      sidebar.insertBefore(injection as Element, dividerAboveChangelog);
    });
  };

  FluxDispatcher.subscribe("USER_SETTINGS_MODAL_OPEN", cb);

  return () => {
    FluxDispatcher.unsubscribe("USER_SETTINGS_MODAL_OPEN", cb);
    canceled = true;
  };
}
