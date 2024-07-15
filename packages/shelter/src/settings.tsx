// Injects a section into user settings

import { getDispatcher } from "./flux";
import { awaitDispatch, getFiber, getFiberOwner, reactFiberWalker } from "./util";
import { Component } from "solid-js";
import { SolidInReactBridge } from "./bridges";
import Settings from "./components/Settings";
import { after } from "spitroast";

type SettingsSection =
  | ["divider"]
  | ["header", string]
  | ["section", string, string, Component, object?]
  | ["button", string, string, () => void];

const shelterSections: SettingsSection[] = [
  ["divider"],
  ["header", "Shelter"],
  ["section", "settings", "Settings", Settings],
];

let injectorSections: SettingsSection[] = [];

let externalSections: SettingsSection[] = [];

const generatePredicateSections = () =>
  [...injectorSections, ...shelterSections, ...externalSections].map((s) => {
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
          ...(s[4] ?? {}),
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
    rerenderSidebar();

    FluxDispatcher.unsubscribe("USER_SETTINGS_MODAL_OPEN", cb);
  };

  FluxDispatcher.subscribe("USER_SETTINGS_MODAL_OPEN", cb);

  return () => {
    FluxDispatcher.unsubscribe("USER_SETTINGS_MODAL_OPEN", cb);
    canceled = true;
    unpatch?.();
  };
}

function rerenderSidebar() {
  const sidebarParent = document.querySelector(`nav[class^="sidebar"]`);
  getFiberOwner(sidebarParent)?.forceUpdate();
}

export function registerSection(...sec: SettingsSection) {
  externalSections.push(sec);
  rerenderSidebar();

  return () => {
    const idx = externalSections.indexOf(sec);
    if (idx === -1) return;

    externalSections.splice(idx, 1);
    rerenderSidebar();
  };
}

export function setInjectorSections(secs: SettingsSection[]) {
  injectorSections = secs;
}

export function removeAllSections() {
  externalSections = [];
}
