import { Component, createSignal, JSX, Show, For } from "solid-js";
import { getSettings, installedPlugins, removePlugin, startPlugin, stopPlugin, StoredPlugin } from "../plugins";
import { devModeReservedId } from "../devmode";
import { css, classes } from "./Plugins.tsx.scss";
import {
  Header,
  HeaderTags,
  IconAdd,
  IconBin,
  IconCog,
  injectCss,
  ModalBody,
  ModalHeader,
  ModalRoot,
  openConfirmationModal,
  openModal,
  Space,
  Switch,
} from "shelter-ui";
import PluginAddModal from "./PluginAddModal";

let cssInjected = false;

export const PluginCard: Component<{
  id: string;
  plugin: StoredPlugin;
}> = (props) => {
  const [on, setOn] = createSignal(props.plugin.on);

  const isDev = () => props.id === devModeReservedId;

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
            class={classes.btn}
            style={on() ? "" : "opacity: 0"}
            onclick={() =>
              openModal((mprops) => (
                <ModalRoot>
                  <ModalHeader close={mprops.close}>Settings - {props.plugin.manifest.name}</ModalHeader>
                  <ModalBody>{getSettings(props.id)({})}</ModalBody>
                </ModalRoot>
              ))
            }
          >
            <IconCog />
          </button>
        </Show>
        <Show keyed when={!isDev()}>
          <button
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
        <Switch
          checked={on()}
          onChange={(newVal) => {
            if (props.plugin.on === newVal) return;
            setOn(!on());
            // oh no! i have to save my pretty animations! (this is utterly stupid)
            setTimeout(() => (newVal ? startPlugin(props.id) : stopPlugin(props.id)), 250);
          }}
        />
      </div>

      <span class={classes.desc}>{props.plugin.manifest.description}</span>
    </div>
  );
};

export default (): JSX.Element => {
  if (!cssInjected) {
    injectCss(css);
    cssInjected = true;
  }

  return (
    <div class={classes.list}>
      <Header tag={HeaderTags.H3}>
        Plugins
        <div
          style={{ display: "inline", "margin-left": ".3rem", cursor: "pointer" }}
          onclick={() => openModal((props) => <PluginAddModal close={props.close} />)}
        >
          <IconAdd />
        </div>
      </Header>

      {/* IIRC not using a <For> here was very intentional due to keying -- sink
       * the only way to do what we need cleanly in solid looks *like this*!:
       * https://codesandbox.io/s/explicit-keys-4iyen?file=/Key.js
       */}
      {Object.entries(installedPlugins())
        .filter(([id]) => id !== devModeReservedId)
        .map(([id, plugin]) => (
          <PluginCard {...{ id, plugin }} />
        ))}
    </div>
  );
};
