// Injects a section into user settings

import { getDispatcher } from "./flux";
import { awaitDispatch, getFiber, getFiberOwner, reactFiberWalker } from "./util";
import { Component } from "solid-js";
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

let externalSections: SettingsSection[] = [];

const generatePredicateSections = () =>
  [...injectedSections, ...externalSections].map((s) => {
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

export async function initSettings() {
  const FluxDispatcher = await getDispatcher();

  let canceled = false;
  let unpatch;
  let isFirst = true;

  const cb = async () => {
    if (!isFirst) return;
    isFirst = false;

    // wait for lazy loading on initial user settings open
    await awaitDispatch((p) => p.type === "TRACK" && p.event === "settings_pane_viewed");

    // I <3 async
    if (canceled) return;

    const sidebar = document.querySelector(`nav > [role=tablist]`);
    if (!sidebar) {
      isFirst = true;
      return;
    }

    const f = reactFiberWalker(
      getFiber(sidebar),
      (node) => typeof node?.type === "function" && node.type.prototype.getPredicateSections,
      true,
    );

    if (typeof f?.type !== "function") {
      isFirst = true;
      return;
    }

    unpatch = after("getPredicateSections", f.type.prototype, (args, ret: any[]) => {
      const changelogIdx = ret.findIndex((s) => s.section === "changelog");
      if (changelogIdx === -1) return;

      // -1 to go ahead of the divider above it
      ret.splice(changelogIdx - 1, 0, ...generatePredicateSections());
    });

    // trigger rerender for first load
    getFiberOwner(sidebar.parentElement)?.forceUpdate();

    FluxDispatcher.unsubscribe("USER_SETTINGS_MODAL_OPEN", cb);
  };

  FluxDispatcher.subscribe("USER_SETTINGS_MODAL_OPEN", cb);

  return () => {
    FluxDispatcher.unsubscribe("USER_SETTINGS_MODAL_OPEN", cb);
    canceled = true;
    unpatch?.();
  };
}

export function registerSection(...sec: SettingsSection) {
  externalSections.push(sec);

  return () => {
    const idx = externalSections.indexOf(sec);
    if (idx !== -1) externalSections.splice(idx, 1);
  };
}

export function removeAllSections() {
  externalSections = [];
}
