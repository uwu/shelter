// Injects a section into user settings

import { getDispatcher } from "./flux";
import { log } from "./util";
import { observe } from "./observer";
import { Component, createMemo, createSignal, For, createEffect } from "solid-js";
import Settings from "./components/Settings";
import { createPersistenceHelper } from "@uwu/shelter-ui";

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
  ["section", "settings", "Settings", Settings, { icon: SettingsIcon }],
];

const [injectorSections, setInjectorSectionsSig] = createSignal<SettingsSection[]>([], { equals: false });

const [externalSections, setExternalSectionsSig] = createSignal<SettingsSection[]>([], { equals: false });

const allSections = createMemo(() => [...injectorSections(), ...shelterSections, ...externalSections()]);

function registerSectionInternal(sec: SettingsSection, injector: boolean) {
  const [target, setter] = injector
    ? [injectorSections, setInjectorSectionsSig]
    : [externalSections, setExternalSectionsSig];

  target().push(sec);
  setter(target());

  return () => {
    const idx = target().indexOf(sec);
    if (idx === -1) return;

    target().splice(idx, 1);
    setter(target());
  };
}

export const registerSection = (...sec: SettingsSection) => registerSectionInternal(sec, false);

// this may cause issues if used with setInjectorSections
export const registerInjSection = (...sec: SettingsSection) => registerSectionInternal(sec, true);

export function setInjectorSections(secs: SettingsSection[]) {
  setInjectorSectionsSig(secs);
}

export function removeAllSections() {
  setExternalSectionsSig([]);
}

// cache these!
const [templatesReady, setTemplatesReady] = createSignal(false);
let buttonTemplate: Element;
let buttonTemplateSelected: Element;
let headerTemplate: Element;
let dividerTemplate: Element;

function SettingsItem(props: { type: "divider" | "header" | "section"; children?: string; onClick?: () => void }) {
  const template = { divider: dividerTemplate, header: headerTemplate, section: buttonTemplate }[props.type];

  const node = template.cloneNode(true) as Element;

  if (props.type === "divider") return node;

  if (props.type === "section") {
    node.ariaLabel = props.children;
    node.addEventListener("click", props.onClick);
  }

  // find the text node's parent
  const childrenRec = node.querySelectorAll("*");
  for (const child of childrenRec) {
    if (child.firstChild instanceof Text) {
      child.firstChild.textContent = props.children;
      break;
    }
  }

  // no element children? assign.
  if (childrenRec.length === 0) node.textContent = props.children;

  return node;
}

export async function initSettings() {
  const FluxDispatcher = await getDispatcher();

  let canceled = false;
  let unpatch: () => void;
  let stopPreviousLazyLoadWait: () => void;

  FluxDispatcher.subscribe("USER_SETTINGS_MODAL_OPEN", openModalCb);

  return () => {
    FluxDispatcher.unsubscribe("USER_SETTINGS_MODAL_OPEN", openModalCb);
    canceled = true;
    unpatch?.();
  };

  // this function is called each time flux fires for a settings open
  async function openModalCb() {
    debugger;

    // hold all state for the current settings instance here, but don't do any injection here
    const [currentSearchTerm, setCurrentSearchTerm] = createSignal<string>();
    const [selectedShelterSection, setSelectedShelterSection] = createSignal<Component | undefined>();

    createEffect(() => {
      console.log("updated selected shelter settings section to", selectedShelterSection());
    });

    const filteredSections = createMemo(() => {
      if (!currentSearchTerm()) return allSections();

      return allSections().filter(
        (sect) =>
          (sect[0] === "section" || sect[0] === "button") &&
          sect[2].toLowerCase().includes(currentSearchTerm().toLowerCase()),
      );
    });

    // generate settings sections
    const generatedSettingsSections = createMemo(() => {
      if (!templatesReady()) return "";

      return (
        <div style="display: contents">
          <For each={filteredSections()}>
            {(section) => {
              switch (section[0]) {
                case "divider":
                  return <SettingsItem type={section[0]} />;

                case "header":
                  const [, headerText] = section;
                  return <SettingsItem type={section[0]}>{headerText}</SettingsItem>;

                case "section":
                  const [, _id, sectionText, sectionComponent, extras] = section;

                  const sectionOnClick = () => setSelectedShelterSection(() => sectionComponent);

                  return (
                    <SettingsItem type={section[0]} onClick={sectionOnClick}>
                      {sectionText}
                    </SettingsItem>
                  );

                case "button":
                  const [, _id2, btnText, btnOnClick] = section;
                  return (
                    <SettingsItem type="section" onClick={btnOnClick}>
                      {btnText}
                    </SettingsItem>
                  );
              }
            }}
          </For>
        </div>
      ) as HTMLDivElement;
    });

    // this function does the actual injection, and automatically reruns if react rips our shit off the DOM.
    // add <PersistenceHelper /> instances wherever necessary
    const injectSidebar = createPersistenceHelper(async (PersistenceHelper: Component) => {
      debugger;

      // wait for lazy loading on initial user settings open
      stopPreviousLazyLoadWait?.();

      const sidebar = await new Promise<HTMLElement | undefined>((res) => {
        const obsCb = (e?: HTMLElement) => {
          unobserve();
          res(e);
        };

        const unobserve = observe("nav > [role=tablist]", obsCb);
        setTimeout(unobserve, 5000);

        stopPreviousLazyLoadWait = obsCb;
      });

      if (!sidebar || canceled) return;

      sidebar.append((<PersistenceHelper />) as HTMLElement);

      // get search bar
      const searchBar = sidebar.querySelector("input");

      if (searchBar) searchBar.oninput = () => setCurrentSearchTerm(searchBar.value);

      // if we have a search injection, just put us at the top
      // we don't need to find templates here because there should already
      // have been an injection with no search term first
      if (currentSearchTerm() && filteredSections().length) {
        const searchResultsHeader = searchBar.nextElementSibling;

        searchResultsHeader?.after((<PersistenceHelper />) as Element, generatedSettingsSections());

        return;
      }

      // steal one of each element type
      if (!templatesReady()) {
        buttonTemplate ||= sidebar.querySelector("[role=tab]:not([class*=selected])") as HTMLElement;
        buttonTemplateSelected ||= sidebar.querySelector("[role=tab][class*=selected]") as HTMLElement;
        headerTemplate ||= sidebar.querySelector("[class*=header]") as HTMLElement;
        dividerTemplate ||= sidebar.querySelector("[class*=separator]") as HTMLElement;

        if (!buttonTemplate || !buttonTemplateSelected || !headerTemplate || !dividerTemplate) {
          log(
            [
              "[Settings injection] Failed to find a template, bailing",
              buttonTemplate,
              buttonTemplateSelected,
              headerTemplate,
              dividerTemplate,
            ],
            "error",
          );
          return;
        }
        setTemplatesReady(true);
      }

      // we want to inject just before "What's New",
      // the last separator is after log out, second to last is before it, third to last is before what's new

      const targetSeparator = sidebar.querySelector(":nth-last-child(3 of [class*=separator])");

      if (!targetSeparator) {
        log("[Settings injection] Failed to find target separator, bailing", "error");
        return;
      }

      const gennedSections = generatedSettingsSections();
      targetSeparator.before((<PersistenceHelper />) as Element, gennedSections);
    });

    await injectSidebar();
  }
}
