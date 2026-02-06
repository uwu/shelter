// Injects a section into user settings

import { getDispatcher } from "./flux";
import { getFiber, getFiberOwner, reactFiberWalker } from "./util";
import { observe } from "./observer";
import { Component } from "solid-js";
import { renderSolidInReact } from "./bridges";
import Settings from "./components/Settings";
import { after } from "spitroast";
import exfiltrate from "./exfiltrate";

function SettingsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      enable-background="new 0 0 24 24"
      height="24px"
      viewBox="0 0 24 24"
      width="24px"
      fill="currentColor"
    >
      <g>
        <path d="M0,0h24v24H0V0z" fill="none" />
        <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
      </g>
    </svg>
  );
}

type Extras = {
  icon?: Component | (() => void);
  badgeCount?: number;
  customDecoration?: Component | (() => void);
};

type SettingsSection =
  | ["divider"]
  | ["header", string]
  | ["section", string, string, Component, Extras?]
  | ["button", string, string, () => void];

const shelterSections: SettingsSection[] = [
  ["divider"],
  ["header", "Shelter"],
  ["section", "shelter-settings", "Settings", Settings, { icon: SettingsIcon }],
];

let injectorSections: SettingsSection[] = [];

let externalSections: SettingsSection[] = [];

function legacyGeneratePredicateSections() {
  return [...injectorSections, ...shelterSections, ...externalSections].map((s) => {
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
          element: () => renderSolidInReact(s[3]),
          ...(s[4] ?? {}),
        };
    }
  });
}

const LAYOUT_PREFIX = "shelter";

function internalGenerateLayout(sectionItem: SettingsSection, layoutSection: any) {
  const [, id, name, pane] = sectionItem;

  const layoutSidebarItem = {
    icon: sectionItem[4]?.icon ? () => renderSolidInReact(sectionItem[4].icon as Component) : () => {},
    trailing: undefined,
    key: `${LAYOUT_PREFIX}_${id}_sidebar_item`,
    layout: [],
    getLegacySearchKey: () => `${LAYOUT_PREFIX}_${id.toUpperCase()}`,
    type: 2,
    useTitle: () => name,
  };

  // TODO: can sanely support BADGE_NEW?

  if (sectionItem[4]?.badgeCount) {
    layoutSidebarItem.trailing = {
      type: 1, // BADGE_COUNT
      useCount: () => sectionItem[4].badgeCount,
    };
  }

  if (sectionItem[4]?.customDecoration) {
    layoutSidebarItem.trailing = {
      type: 2, // STRONGLY_DISCOURAGED_CUSTOM
      useCustomDecoration: (visibleContent, isSelected) =>
        renderSolidInReact(sectionItem[4].customDecoration as Component, { visibleContent, isSelected }),
    };
  }

  const layoutPanel = {
    key: `${LAYOUT_PREFIX}_${id}_panel`,
    layout: [],
    type: 3,
    useTitle: () => name,
    StronglyDiscouragedCustomComponent: () => renderSolidInReact(pane as Component),
  };

  layoutSidebarItem.layout.push(layoutPanel);
  return layoutSidebarItem;
}

function generateSectionLayout(sectionName: string) {
  return {
    key: `${LAYOUT_PREFIX}_${sectionName.toLowerCase()}_section`,
    layout: [],
    type: 1,
    useTitle: () => sectionName,
  };
}

function buildLayout() {
  const layout = [];
  let layoutSection = generateSectionLayout("Unknown");

  for (const s of [...injectorSections, ...shelterSections, ...externalSections]) {
    if (s[0] === "header") {
      layoutSection = generateSectionLayout(s[1]);
      layout.push(layoutSection);
      continue;
    }

    if (s[0] === "section") {
      layoutSection.layout.push(internalGenerateLayout(s, layoutSection));
      continue;
    }
  }

  return layout;
}

export async function initSettings() {
  const [uninjectLegacySettings] = await Promise.all([legacyInjectSettings()]); // TODO: add normal settings injection back

  return () => {
    uninjectLegacySettings();
  };
}

async function legacyInjectSettings() {
  const FluxDispatcher = await getDispatcher();

  // Force disable settings redesign experiment until the new injection method works without issues
  FluxDispatcher.dispatch({
    type: "APEX_EXPERIMENT_OVERRIDE_CREATE",
    experimentName: "2025-09-user-settings-redesign-1",
    variantId: -1,
  });

  let canceled = false;
  let unpatch: () => void;
  let stopPrevious: () => void;

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
      ret.splice(changelogIdx - 1, 0, ...legacyGeneratePredicateSections());
    });

    // trigger rerender for first load
    legacyRerenderSidebar();

    FluxDispatcher.unsubscribe("USER_SETTINGS_MODAL_OPEN", cb);
  };

  FluxDispatcher.subscribe("USER_SETTINGS_MODAL_OPEN", cb);

  return () => {
    FluxDispatcher.unsubscribe("USER_SETTINGS_MODAL_OPEN", cb);
    canceled = true;
    unpatch?.();
  };
}

async function injectSettings() {
  const partialRoot = await exfiltrate("buildLayout", true, (v) => v.key === "$Root");
  const unpatch = after("buildLayout", partialRoot, function (args, layout) {
    // insert layout after activity section, otherwise before the log out button
    const activityIndex = layout.findIndex(({ key }) => key === "activity_section");
    const insertIndex = activityIndex === -1 ? layout.length - 1 : activityIndex + 1;

    layout.splice(insertIndex, 0, ...buildLayout());
    return layout;
  });

  return () => unpatch?.();
}

function legacyRerenderSidebar() {
  const sidebarParent = document.querySelector(`nav:has([role=tablist])`);
  getFiberOwner(sidebarParent)?.forceUpdate();
}

function registerSectionInternal(sec: SettingsSection, injector: boolean) {
  const secs = injector ? injectorSections : externalSections;

  secs.push(sec);
  legacyRerenderSidebar();

  return () => {
    const idx = secs.indexOf(sec);
    if (idx === -1) return;

    secs.splice(idx, 1);
    legacyRerenderSidebar();
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
