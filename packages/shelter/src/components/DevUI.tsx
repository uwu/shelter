import { Button, Divider, Header, HeaderTags, injectCss, Space, SwitchItem, Text } from "shelter-ui";
import { dbStore } from "../storage";
import { PluginCard } from "./Plugins";
import { devModeReservedId } from "../devmode";
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
      <Header tag={HeaderTags.H3} class={classes.head}>
        Developer Tools
      </Header>
      <SwitchItem value={dbStore.logDispatch} onChange={(v) => (dbStore.logDispatch = v)} hideBorder>
        Log FluxDispatcher events to the console
      </SwitchItem>

      {/* draw the divider ourselves so we can pick smaller spacing */}
      <Divider mt mb />

      <Show
        when={installedPlugins()[devModeReservedId]}
        keyed
        fallback={
          <div class={classes.launch}>
            <Text>
              When in dev mode, shelter tethers to a running
              <Space />
              <a href="https://github.com/uwu/shelter/tree/main/packages/lune#readme" target="_blank">
                Lune
              </a>
              <Space />
              dev server, allowing hot reloading of a temporary dev plugin.
            </Text>
            <Button grow>Tether to Lune</Button>
          </div>
        }
      >
        {(plugin) => (
          <>
            <Text>
              shelter is currently tethered to
              <Space />
              <a href="https://github.com/uwu/shelter/tree/main/packages/lune#readme" target="_blank">
                Lune
              </a>
              <Space />
              via dev mode. The following dev plugin is loaded:
            </Text>
            <PluginCard id={devModeReservedId} plugin={plugin} />
          </>
        )}
      </Show>
    </div>
  );
};
