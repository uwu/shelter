// Injects a section into user settings

import getDispatcher from "./getDispatcher";
import { getFiber, reactFiberWalker } from "./util";

export async function initSettings() {
  const FluxDispatcher = await getDispatcher();

  const cb = () =>
    queueMicrotask(() => {
      const sidebar = document.querySelector("nav > [role=tablist]");
      if (!sidebar) return;

      const changelogIdx = [...sidebar.children].findIndex(
        (c) => reactFiberWalker(getFiber(c), "id", true)?.pendingProps?.id === "changelog"
      );
      if (changelogIdx === -1) return;

      // indexes are kinda fucky so idk?
      const dividerAboveChangelog = sidebar.children[changelogIdx];

      const tabClasses = sidebar.children[changelogIdx + 1].className;
      const dividerClasses = dividerAboveChangelog.className;
      const headerClasses = sidebar.firstElementChild.className;

      // TODO: try to get babel-preset-solid to play nice with esbuild
      const shelterDivider = document.createElement("div");
      shelterDivider.className = dividerClasses;

      const shelterHeader = document.createElement("div");
      shelterHeader.className = headerClasses;
      shelterHeader.setAttribute("role", "button");
      shelterHeader.tabIndex = -1;
      shelterHeader.textContent = "Shelter";

      const shelterTab = document.createElement("div");
      shelterTab.className = tabClasses;
      shelterTab.setAttribute("role", "tab");
      shelterTab.ariaSelected = "false";
      shelterTab.ariaDisabled = "false";
      shelterTab.tabIndex = -1;
      shelterTab.ariaLabel = "Test tab";
      shelterTab.textContent = "Test tab";

      sidebar.insertBefore(shelterDivider, dividerAboveChangelog);
      sidebar.insertBefore(shelterHeader, dividerAboveChangelog);
      sidebar.insertBefore(shelterTab, dividerAboveChangelog);
    });

  FluxDispatcher.subscribe("USER_SETTINGS_MODAL_OPEN", cb);

  return () => FluxDispatcher.unsubscribe("USER_SETTINGS_MODAL_OPEN", cb);
}
