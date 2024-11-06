import { Component, createSignal, JSX, Show } from "solid-js";
import {
  getSettings,
  installedPlugins,
  removePlugin,
  showSettingsFor,
  startPlugin,
  stopPlugin,
  StoredPlugin,
  updatePlugin,
} from "../plugins";
import { devModeReservedId } from "../devmode";
import { css, classes } from "./Plugins.tsx.scss";
import {
  Header,
  HeaderTags,
  IconBin,
  IconCog,
  injectCss,
  openConfirmationModal,
  Space,
  Switch,
  focusring,
  tooltip,
  TextBox,
  IconEdit,
  IconUpdate,
  showToast,
  Button,
  ButtonLooks,
  ButtonSizes,
  ButtonColors,
} from "@uwu/shelter-ui";
import { addPluginModal, editPluginModal } from "./PluginEditModal";
import Fuse from "fuse.js";

false && focusring;
false && tooltip;

let cssInjected = false;

export const PluginCard: Component<{
  id: string;
  plugin: StoredPlugin;
}> = (props) => {
  if (!cssInjected) {
    injectCss(css);
    cssInjected = true;
  }

  const [on, setOn] = createSignal(props.plugin.on);

  const isDev = () => props.id === devModeReservedId;

  const ldi = props.plugin.injectorIntegration;

  return (
    <div class={classes.plugin}>
      <div class={classes.row}>
        <strong>{props.plugin.manifest.name}</strong>
        <Space />
        by
        <Space />
        <span class={classes.author}>{props.plugin.manifest.author}</span>
        <div style="flex:1" />
        <Show keyed when={getSettings(props.id)}>
          <button
            use:tooltip="Open settings"
            aria-label={`open settings for ${props.plugin.manifest.name}`}
            use:focusring
            class={classes.btn}
            style={on() ? "" : "opacity: 0"}
            onclick={() => showSettingsFor(props.id)}
          >
            <IconCog />
          </button>
        </Show>
        <Show keyed when={!isDev() && !props.plugin.local && (!ldi || ldi.allowedActions.update)}>
          <button
            use:tooltip="Check for update"
            aria-label={`update ${props.plugin.manifest.name}`}
            use:focusring
            class={classes.btn}
            onClick={() =>
              updatePlugin(props.id).then(
                (updated) =>
                  showToast({
                    title: updated
                      ? `Updated ${props.plugin.manifest.name} successfully`
                      : `${props.plugin.manifest.name} is already up to date`,
                    duration: 3000,
                  }),
                (error) =>
                  showToast({
                    title: `Failed to update ${props.plugin.manifest.name}`,
                    content: error?.message ?? error + "",
                    duration: 3000,
                  }),
              )
            }
          >
            <IconUpdate />
          </button>
        </Show>
        <Show keyed when={!isDev() && (!ldi || ldi.allowedActions.edit)}>
          <button
            use:tooltip="Edit"
            aria-label={`edit ${props.plugin.manifest.name}`}
            use:focusring
            class={classes.btn}
            onClick={() => editPluginModal(props.id)}
          >
            <IconEdit />
          </button>
        </Show>
        <Show keyed when={!isDev() && (!ldi || ldi.allowedActions.delete)}>
          <button
            use:tooltip="Delete"
            aria-label={`delete ${props.plugin.manifest.name}`}
            use:focusring
            class={classes.btn}
            onclick={() =>
              openConfirmationModal({
                body: () => `Are you sure you want to delete plugin ${props.plugin.manifest.name}?`,
                header: () => "Confirm plugin deletion",
                type: "danger",
                confirmText: "Delete",
              }).then(
                () => removePlugin(props.id),
                () => {},
              )
            }
          >
            <IconBin />
          </button>
        </Show>
        <Show keyed when={!ldi || ldi.allowedActions.toggle}>
          <Switch
            aria-label={`${on() ? "disable" : "enable"} ${props.plugin.manifest.name}`}
            checked={on()}
            onChange={(newVal) => {
              if (props.plugin.on === newVal) return;
              setOn(!on());
              // oh no! i have to save my pretty animations! (this is utterly stupid)
              setTimeout(() => (newVal ? startPlugin(props.id) : stopPlugin(props.id)), 226);
            }}
          />
        </Show>
      </div>

      <span class={classes.desc}>{props.plugin.manifest.description}</span>
    </div>
  );
};

const fuzzy = (plugins: [string, StoredPlugin][], searchTerm: string) =>
  !searchTerm || searchTerm === ""
    ? plugins
    : new Fuse(plugins, {
        threshold: 0.5,
        useExtendedSearch: true,
        keys: ["1.manifest.name", "1.manifest.author", "1.manifest.description"],
      })
        .search(searchTerm)
        .map((res) => res.item);

export default (): JSX.Element => {
  if (!cssInjected) {
    injectCss(css);
    cssInjected = true;
  }

  const [searchTerm, setSearchTerm] = createSignal("");

  return (
    <div class={classes.list}>
      <Header tag={HeaderTags.EYEBROW}>{`Plugins (${Object.keys(installedPlugins()).length})`}</Header>
      <div class={classes.bar}>
        <TextBox value={searchTerm()} onInput={setSearchTerm} placeholder="Search plugins..." />
        <Button
          grow
          look={ButtonLooks.FILLED}
          color={ButtonColors.BRAND}
          size={ButtonSizes.MEDIUM}
          onClick={addPluginModal}
        >
          Add Plugin
        </Button>
      </div>

      {/* IIRC not using a <For> here was very intentional due to keying -- sink
       * the only way to do what we need cleanly in solid looks *like this*!:
       * https://codesandbox.io/s/explicit-keys-4iyen?file=/Key.js
       */}
      {fuzzy(Object.entries(installedPlugins()), searchTerm())
        .filter(
          ([id, obj]) => id !== devModeReservedId && (!obj.injectorIntegration || obj.injectorIntegration.isVisible),
        )
        .sort(([, pluginA], [, pluginB]) => {
          const nameA = pluginA.manifest.name?.toLowerCase();
          const nameB = pluginB.manifest.name?.toLowerCase();
          return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
        })
        .map(([id, plugin]) => (
          <PluginCard {...{ id, plugin }} />
        ))}
    </div>
  );
};
