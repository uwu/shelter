// Injects a section into user settings

import { getDispatcher } from "./flux";
import { awaitDispatch, getFiber, getFiberOwner, reactFiberWalker } from "./util";
import { observe } from "./observer";
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
  let stopPrevious;

  const cb = async () => {
    stopPrevious?.();

    // wait for lazy loading on initial user settings open
    const sidebar = await new Promise<Element | void>((res) => {
      const trackCallback = (p: any) => {
        if (p.event === "settings_pane_viewed" && p.properties.settings_type === "user") {
          res(document.querySelector("nav > [role=tablist]"));
        }
      };
      FluxDispatcher.subscribe("TRACK", trackCallback);

      // fallback in case track dispatches are disabled (e.g. BD's DoNotTrack)
      const unobserve = observe("nav > [role=tablist]", res);
      setTimeout(unobserve, 3_000);

      stopPrevious = () => {
        FluxDispatcher.unsubscribe("TRACK", trackCallback);
        unobserve();
        res();
      };
    });

    if (!sidebar || canceled) return;

    const f = reactFiberWalker(
      getFiber(sidebar),
      (node) => typeof node?.type === "function" && node.type.prototype.getPredicateSections,
      true,
    );

    if (typeof f?.type !== "function") return;

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

function registerSectionInternal(sec: SettingsSection, injector: boolean) {
  const secs = injector ? injectorSections : externalSections;

  secs.push(sec);
  rerenderSidebar();

  return () => {
    const idx = secs.indexOf(sec);
    if (idx === -1) return;

    secs.splice(idx, 1);
    rerenderSidebar();
  };
}

export const registerSection = (...sec: SettingsSection) => registerSectionInternal(sec, false);

// this may cause issues if used with setInjectorSections
export const registerInjSection = (...sec: SettingsSection) => registerSectionInternal(sec, true);

export function setInjectorSections(secs: SettingsSection[]) {
  injectorSections = secs;
}

export function removeAllSections() {
  externalSections = [];
}
