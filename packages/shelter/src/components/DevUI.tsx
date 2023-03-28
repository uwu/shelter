import { Header, HeaderTags, injectCss, showToast, Space, SwitchItem } from "shelter-ui";
import { dbStore } from "../storage";
import { PluginCard } from "./Plugins";
import { devModeReservedId, enableDevmode, stopDevmode } from "../devmode";
import { installedPlugins } from "../plugins";
import { css, classes } from "./DevUI.tsx.scss";
import { Show } from "solid-js";

let injectedCss = false;

export default () => {
  if (!injectedCss) {
    injectCss(css);
    injectedCss = true;
  }

  return (
    <div class={classes.open}>
      <SwitchItem value={dbStore.logDispatch} onChange={(v) => (dbStore.logDispatch = v)}>
        Log FluxDispatcher events to the console
      </SwitchItem>

      <SwitchItem
        hideBorder
        value={devModeReservedId in installedPlugins()}
        onChange={(val) =>
          val
            ? enableDevmode().catch((e) =>
                showToast({
                  title: "Could not enable dev mode",
                  content: e.message,
                  duration: 3000,
                }),
              )
            : stopDevmode()
        }
        note={
          devModeReservedId in installedPlugins() ? (
            <>
              shelter is currently tethered to
              <Space />
              <a href="https://github.com/uwu/shelter/tree/main/packages/lune#readme" target="_blank">
                Lune
              </a>
              <Space />
              via dev mode. To disable dev mode, close Lune. The following dev plugin is loaded:
            </>
          ) : (
            <>
              When in dev mode, shelter tethers to a running
              <Space />
              <a href="https://github.com/uwu/shelter/tree/main/packages/lune#readme" target="_blank">
                Lune
              </a>
              <Space />
              dev server, allowing hot reloading of a temporary dev plugin.
            </>
          )
        }
      >
        Lune Dev Mode
      </SwitchItem>

      <Show when={installedPlugins()[devModeReservedId]} keyed>
        {(plugin) => <PluginCard id={devModeReservedId} plugin={plugin} />}
      </Show>
    </div>
  );
};
