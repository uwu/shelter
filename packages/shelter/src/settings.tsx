// Injects a section into user settings

import { getFiber, reactFiberWalker } from "./util";
import { Component } from "solid-js";
import { renderSolidInReact } from "./bridges";
import Settings from "./components/Settings";

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

export enum BadgeType {
  NEW = 0,
  BETA = 1,
  COUNT = 2,
  WARNING = 3,
  STRONGLY_DISCOURAGED_CUSTOM = 4,
}

export type SettingsBadge =
  | { type: BadgeType.NEW }
  | { type: BadgeType.BETA }
  | { type: BadgeType.COUNT; count: number }
  | { type: BadgeType.WARNING }
  | { type: BadgeType.STRONGLY_DISCOURAGED_CUSTOM; customDecoration: Component | (() => void) };

export type SettingsExtras = {
  icon?: Component | (() => void);
  badge?: SettingsBadge;
};

export type SettingsSection =
  | ["divider"]
  | ["header", string]
  | ["section", string, string, Component, SettingsExtras?];

const shelterSections: SettingsSection[] = [
  ["divider"],
  ["header", "Shelter"],
  ["section", "shelter-settings", "Settings", Settings, { icon: SettingsIcon }],
];

let injectorSections: SettingsSection[] = [];

let externalSections: SettingsSection[] = [];

const LAYOUT_PREFIX = "shelter";
const LANGUAGE_AND_TIME_PANEL_KEY = "language_and_time_panel";

type LayoutTemplates = Record<"section" | "sidebarItem" | "panel" | "category" | "setting", any>;

// parse the layout tree from the language and time setting. this should be stable enough
// and is the simplest one i found in the tree
function getLayoutTemplates(layout: any[]): LayoutTemplates | undefined {
  for (const section of layout) {
    const sidebarItem = (section.layout ?? []).find((item) =>
      (item.layout ?? []).some((panel) => panel.key === LANGUAGE_AND_TIME_PANEL_KEY),
    );
    const panel = sidebarItem?.layout?.find((item) => item.key === LANGUAGE_AND_TIME_PANEL_KEY);
    const category = panel?.layout?.find((item) => Array.isArray(item.layout));
    const setting = category?.layout?.find((node) => typeof node.Component === "function");

    if (sidebarItem && panel && category && setting) return { section, sidebarItem, panel, category, setting };
  }
}

function internalGenerateLayout(sectionItem: SettingsSection, templates?: LayoutTemplates) {
  const [, id, name, pane] = sectionItem;
  const extras = sectionItem[4];

  const layoutSidebarItem: any = {
    icon: extras?.icon ? () => renderSolidInReact(extras.icon as Component) : () => null,
    key: `${LAYOUT_PREFIX}_${id}_sidebar_item`,
    layout: [],
    type: templates?.sidebarItem?.type ?? 2,
    useTitle: () => name,
  };

  const badge = extras?.badge;
  if (badge?.type === BadgeType.STRONGLY_DISCOURAGED_CUSTOM)
    layoutSidebarItem.usePersistentBadge = () => ({
      badgeType: BadgeType.STRONGLY_DISCOURAGED_CUSTOM,
      customBadge: renderSolidInReact(badge.customDecoration as Component),
    });
  else if (badge?.type === BadgeType.COUNT)
    layoutSidebarItem.usePersistentBadge = () => ({ badgeType: BadgeType.COUNT, count: badge.count });
  else if (badge?.type === BadgeType.WARNING)
    layoutSidebarItem.usePersistentBadge = () => ({ badgeType: BadgeType.WARNING });
  else if (badge?.type === BadgeType.BETA) layoutSidebarItem.usePersistentBadge = () => ({ badgeType: BadgeType.BETA });
  else if (badge?.type === BadgeType.NEW) layoutSidebarItem.usePersistentBadge = () => ({ badgeType: BadgeType.NEW });

  const layoutSetting: any = {
    // search should work again with this instead of legacy search key
    useSearchTerms: () => [name, id],
    key: `${LAYOUT_PREFIX}_${id}_setting`,
    Component: () => renderSolidInReact(pane as Component),
    type: templates?.setting?.type ?? 19,
  };

  const layoutCategory: any = {
    key: `${LAYOUT_PREFIX}_${id}_category`,
    layout: [layoutSetting],
    type: templates?.category?.type ?? 5,
  };

  const layoutPanel: any = {
    key: `${LAYOUT_PREFIX}_${id}_panel`,
    layout: [layoutCategory],
    type: templates?.panel?.type ?? 3,
    useTitle: () => name,
  };

  // just in case.
  layoutSetting.parent = layoutCategory;
  layoutCategory.parent = layoutPanel;
  layoutPanel.parent = layoutSidebarItem;
  layoutSidebarItem.layout.push(layoutPanel);
  return layoutSidebarItem;
}

function generateSectionLayout(sectionName: string, templates?: LayoutTemplates) {
  return {
    key: `${LAYOUT_PREFIX}_${sectionName.toLowerCase()}_section`,
    layout: [],
    type: templates?.section?.type ?? 1,
    useTitle: () => sectionName,
  };
}

function buildLayout(templates?: LayoutTemplates) {
  const layout = [];
  let layoutSection = generateSectionLayout("Unknown", templates);
  let layoutSectionAdded = false;

  for (const s of [...injectorSections, ...shelterSections, ...externalSections]) {
    if (s[0] === "header") {
      layoutSection = generateSectionLayout(s[1], templates);
      layout.push(layoutSection);
      layoutSectionAdded = true;
      continue;
    }

    if (!layoutSectionAdded && s[0] === "section") {
      layout.push(layoutSection);
      layoutSectionAdded = true;
    }

    if (s[0] === "section") {
      const sidebarItem = internalGenerateLayout(s, templates);
      sidebarItem.parent = layoutSection;
      layoutSection.layout.push(sidebarItem);
    }
  }

  return layout;
}

function patchLayout(root: any) {
  const { layout } = root;
  // steal the template
  const templates = getLayoutTemplates(layout);

  // remove old layout we injected
  for (let i = layout.length - 1; i >= 0; i--) if (layout[i].key?.startsWith(`${LAYOUT_PREFIX}_`)) layout.splice(i, 1);

  // injecteth
  const gamesAndAppsIndex = layout.findIndex(({ key }) => key === "games_and_apps_section");
  const generatedLayout = buildLayout(templates);
  generatedLayout.forEach((section) => (section.parent = root));
  layout.splice(gamesAndAppsIndex === -1 ? layout.length : gamesAndAppsIndex + 1, 0, ...generatedLayout);
}

export { injectSettings as initSettings };

function injectSettings() {
  const patchSym = Symbol();

  // Targets `("buildLayout" in node && "function" == typeof node.buildLayout)`
  // If the setter is invoked on anything other than the prototype, simply set
  // the property as normal; while Discord does not do this, other mods do.
  // The enclosing function is called recursively over the entire settings tree,
  // eventually a leaf node without a `buildLayout` property is hit, causing the
  // getter to execute, a microtask is queued to continue after the walker is done.
  // As this getter is called multiple times, a symbol is used to patch only once.

  Object.defineProperty(Object.prototype, "buildLayout", {
    configurable: true,
    enumerable: false,
    get() {
      queueMicrotask(() => {
        let root = this;
        while (root.parent) root = root.parent;

        if (root[patchSym] || root.key !== "$Root") return;
        root[patchSym] = true;

        patchLayout(root);
      });
    },
    set(v) {
      if (this === Object.prototype) return;
      Object.defineProperty(this, "buildLayout", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: v,
      });
    },
  });

  return () => {
    delete Object.prototype["buildLayout"];
  };
}

function rerenderSettings() {
  const sidebar = document.querySelector(`[data-settings-sidebar-item]`);
  if (!sidebar) return;

  const getSetStates = (fiber: any) => {
    const setStates = [];
    // traverse hooks to find set states
    for (let hook: any = fiber.memoizedState; hook; hook = hook.next) {
      if (hook.memoizedState instanceof Set && typeof hook.queue?.dispatch === "function") {
        setStates.push(hook.queue.dispatch);
      }
    }
    return setStates;
  };

  const getNormalizedRoot = (fiber: any) => {
    for (let hook: any = fiber.memoizedState; hook; hook = hook.next) {
      const value = hook.memoizedState?.[0];
      if (value?.key === "$Root" && Array.isArray(value.layout)) return value;
    }
  };

  // this was fun to figure out.
  // walk the fiber, and for each fiber search the memoized sets
  const settingsFiber = reactFiberWalker(
    getFiber(sidebar),
    (fiber) => (fiber.pendingProps?.partialRoot ?? fiber.memoizedProps?.partialRoot) && getSetStates(fiber).length >= 2,
    true,
  );
  if (settingsFiber) {
    const root = getNormalizedRoot(settingsFiber);
    if (root) patchLayout(root);
    // just make a new set and react *somehow* doesnt explode, honestly quite incredible
    getSetStates(settingsFiber)[0]?.((state) => new Set(state));
  }
}

function findSectionId(section: SettingsSection) {
  return section[0] === "section" ? section[1] : undefined;
}

function registerSectionInternal(sec: SettingsSection, injector: boolean) {
  const secs = injector ? injectorSections : externalSections;
  const id = findSectionId(sec);
  const idx = id === undefined ? -1 : secs.findIndex((section) => findSectionId(section) === id);

  if (idx === -1) secs.push(sec);
  else secs[idx] = sec;
  rerenderSettings();

  return () => {
    const idx = secs.indexOf(sec);
    if (idx === -1) return;

    secs.splice(idx, 1);
    rerenderSettings();
  };
}

export const registerSection = (...sec: SettingsSection) => registerSectionInternal(sec, false);

// this may cause issues if used with setInjectorSections
export const registerInjSection = (...sec: SettingsSection) => registerSectionInternal(sec, true);

export function setInjectorSections(secs: SettingsSection[]) {
  injectorSections = secs;
  rerenderSettings();
}

export function removeAllSections() {
  externalSections = [];
  rerenderSettings();
}
