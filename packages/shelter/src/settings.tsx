// Injects a section into user settings

import { getDispatcher } from "./flux";
import { getFiber, getFiberOwner, getProps, reactFiberWalker } from "./util";
import { observe } from "./observer";
import { Component } from "solid-js";
import { SolidInReactBridge } from "./bridges";
import Settings from "./components/Settings";
import { after } from "spitroast";

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
  ["section", "settings", "Settings", Settings],
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
          element: () => <SolidInReactBridge comp={s[3]} />,
          ...(s[4] ?? {}),
        };
    }
  });
}

const LAYOUT_PREFIX = "shelter";

function internalGenerateLayoutAndMappings(sectionItem: SettingsSection, layoutSection: any) {
  const [, id, name, pane] = sectionItem;

  const layoutSidebarItem = {
    icon: sectionItem[4]?.icon ? () => <SolidInReactBridge comp={sectionItem[4].icon} /> : () => {},
    trailing: undefined,
    key: `${LAYOUT_PREFIX}_${id}_sidebar_item`,
    layout: [],
    legacySearchKey: `${LAYOUT_PREFIX}_${id.toUpperCase()}`,
    parent: layoutSection,
    type: 2,
    useTitle: () => name,
  };

  // TODO: can sanely support BADGE_NEW?

  if (sectionItem[4]?.badgeCount) {
    layoutSidebarItem.trailing = {
      type: 2, // BADGE_COUNT
      useCount: () => sectionItem[4].badgeCount,
    };
  }

  if (sectionItem[4]?.customDecoration) {
    layoutSidebarItem.trailing = {
      type: 3, // STRONGLY_DISCOURAGED_CUSTOM
      useDecoration: (visibleContent, isSelected) => (
        <SolidInReactBridge comp={sectionItem[4].customDecoration} props={{ visibleContent, isSelected }} />
      ),
    };
  }

  const layoutPanel = {
    key: `${LAYOUT_PREFIX}_${id}_panel`,
    layout: [],
    parent: layoutSidebarItem,
    type: 3,
    useTitle: () => name,
  };

  const layoutPane = {
    key: `${LAYOUT_PREFIX}_${id}_pane`,
    layout: [],
    parent: layoutPanel,
    render: () => <SolidInReactBridge comp={pane} />,
    type: 4,
    useTitle: () => name,
  };

  layoutPanel.layout.push(layoutPane);
  layoutSidebarItem.layout.push(layoutPanel);
  layoutSection.layout.push(layoutSidebarItem);

  const mapping = {
    [layoutSection.key]: {
      node: layoutSection,
    },
    [layoutSidebarItem.key]: {
      node: layoutSidebarItem,
      targetPanelKey: layoutPanel.key,
    },
    [layoutPanel.key]: {
      node: layoutPanel,
      targetPanelKey: layoutPanel.key,
    },
    [layoutPane.key]: {
      node: layoutPane,
      targetPanelKey: layoutPanel.key,
    },
  };

  return { layout: layoutSection, mapping };
}

function generateSectionLayout(root: any, sectionName: string) {
  return {
    key: `${LAYOUT_PREFIX}_${sectionName.toLowerCase()}_section`,
    layout: [],
    parent: root,
    type: 1,
    useLabel: () => sectionName,
  };
}

function generateLayoutsAndMappings(root: any) {
  const layouts = {};
  const mappings = {};
  let layoutSection = generateSectionLayout(root, "Unknown");

  for (const s of [...injectorSections, ...shelterSections, ...externalSections]) {
    if (s[0] === "header") {
      layoutSection = generateSectionLayout(root, s[1]);
      continue;
    }

    if (s[0] === "section") {
      const { layout, mapping } = internalGenerateLayoutAndMappings(s, layoutSection);
      Object.assign(mappings, mapping);
      layouts[layout.key] = layout;

      continue;
    }
  }

  return { layouts, mappings };
}

export async function initSettings() {
  const [uninjectLegacySettings, uninjectSettings] = await Promise.all([legacyInjectSettings(), injectSettings()]);

  return () => {
    uninjectLegacySettings();
    uninjectSettings();
  };
}

async function legacyInjectSettings() {
  const FluxDispatcher = await getDispatcher();

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
  const FluxDispatcher = await getDispatcher();

  let canceled = false;
  let stopPrevious: () => void;

  const cb = async () => {
    stopPrevious?.();

    // wait for lazy loading on initial user settings open
    const sidebar = await new Promise<Element | void>((res) => {
      const trackCallback = (p: any) => {
        if (p.event === "settings_pane_viewed" && p.properties.settings_type === "user") {
          res(document.querySelector("[data-list-id=settings-sidebar]"));
        }
      };
      FluxDispatcher.subscribe("TRACK", trackCallback);

      // fallback in case track dispatches are disabled (e.g. BD's DoNotTrack)
      const unobserve = observe("[data-list-id=settings-sidebar]", res);
      setTimeout(unobserve, 3_000);

      stopPrevious = () => {
        FluxDispatcher.unsubscribe("TRACK", trackCallback);
        unobserve();
        res();
      };
    });

    if (!sidebar || canceled) return;

    const sidebarDirectoryFiber = reactFiberWalker(
      getFiber(document.querySelector("[data-list-id=settings-sidebar]")),
      "directory",
      true,
    );

    // this function gets assigned by something else later on. That's why patcher wouldn't work here.
    const originalType = sidebarDirectoryFiber.type as Function;
    Object.defineProperty(sidebarDirectoryFiber, "type", {
      get: () =>
        function () {
          const settings = arguments[0];

          const { layouts, mappings } = generateLayoutsAndMappings(settings.root);

          for (const [key, val] of Object.entries(mappings)) {
            settings.directory.map.set(key, val);
          }

          // remove shelter sections that were unregistered
          settings.root.layout = settings.root.layout.filter(
            ({ key }) =>
              !key.startsWith(LAYOUT_PREFIX) || Object.values(layouts).some((other: any) => other.key === key),
          );

          // ignore duplicates
          const filteredLayouts = Object.values(layouts).filter(
            ({ key }) => !settings.root.layout.some((other) => other.key === key),
          );

          // insert layout after activity section, otherwise before the log out button
          const activityIndex = settings.root.layout.findIndex(({ key }) => key === "activity_section");
          const insertIndex = activityIndex === -1 ? settings.root.layout.length - 1 : activityIndex + 1;

          settings.root.layout.splice(insertIndex, 0, ...filteredLayouts);

          return originalType.apply(this, arguments);
        },
      set: () => {},
    });

    refreshSidebarSections();
  };

  FluxDispatcher.subscribe("USER_SETTINGS_MODAL_OPEN", cb);

  return () => {
    FluxDispatcher.unsubscribe("USER_SETTINGS_MODAL_OPEN", cb);
    canceled = true;
  };
}

function refreshSidebarSections() {
  document.querySelectorAll("[class^=searchBarContainer] input").forEach((searchInput) => {
    const props = getProps(searchInput);
    const oldValue = props.value;
    props.onChange({ currentTarget: { value: " " } });
    setTimeout(() => props.onChange({ currentTarget: { value: oldValue } }));
  });
}

function legacyRerenderSidebar() {
  const sidebarParent = document.querySelector(`nav[class^="sidebar"]`);
  getFiberOwner(sidebarParent)?.forceUpdate();
}

function registerSectionInternal(sec: SettingsSection, injector: boolean) {
  const secs = injector ? injectorSections : externalSections;

  secs.push(sec);
  legacyRerenderSidebar();
  refreshSidebarSections();

  return () => {
    const idx = secs.indexOf(sec);
    if (idx === -1) return;

    secs.splice(idx, 1);
    legacyRerenderSidebar();
    refreshSidebarSections();
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
