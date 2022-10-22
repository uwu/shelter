import { createSignal, For, Index, JSX } from "solid-js";
import { installedPlugins, startPlugin, stopPlugin } from "../plugins";
import { css, classes } from "./Plugins.tsx.scss";
import { Header, HeaderTags, injectCss, Space, Switch } from "shelter-ui";

let cssInjected = false;

export default (): JSX.Element => {
  if (!cssInjected) {
    injectCss(css);
    cssInjected = true;
  }

  return (
    <div class={classes.list}>
      <Header tag={HeaderTags.H3}>Plugins</Header>

      {Object.entries(installedPlugins()).map(([id, plugin]) => {
        const [on, setOn] = createSignal(plugin.on);

        return (
          <div class={classes.plugin}>
            <div class={classes.row}>
              <strong>{plugin.manifest.name}</strong>
              <Space />
              by
              <Space />
              <span class={classes.author}>{plugin.manifest.author}</span>
              <div style="flex:1" />
              <Switch
                checked={on()}
                onChange={(newVal) => {
                  if (plugin.on === newVal) return;
                  setOn(!on());
                  // oh no! i have to save my pretty animations! (this is utterly stupid)
                  setTimeout(() => (newVal ? startPlugin(id) : stopPlugin(id)), 250);
                }}
              />
            </div>

            <span class={classes.desc}>{plugin.manifest.description}</span>
          </div>
        );
      })}
    </div>
  );
};
