import {
  Button,
  ButtonColors,
  ButtonLooks,
  ButtonSizes,
  Checkbox,
  Header,
  HeaderTags,
  injectCss,
  ModalBody,
  ModalConfirmFooter,
  ModalHeader,
  ModalRoot,
  openModal,
  Space,
} from "@uwu/shelter-ui";
import { exportData, installedPlugins } from "../plugins";
import { createSignal, For, untrack } from "solid-js";
import { classes, css } from "./DataManagement.tsx.scss";

let injectedCss = false;

export const ExportModal = ({ close }: { close: () => void }) => {
  if (!injectedCss) {
    injectedCss = true;
    injectCss(css);
  }

  const [pluginsActive, setPluginsActive] = createSignal(new Set<string>(), { equals: false });
  const [pluginsSaveData, setPluginsSaveData] = createSignal(new Map<string, boolean>(), { equals: false });

  // all plugins selected by default
  for (const id in untrack(installedPlugins)) {
    pluginsActive().add(id);
    pluginsSaveData().set(id, true);
  }

  return (
    <ModalRoot>
      <ModalHeader close={close}>Export Data</ModalHeader>
      <ModalBody>
        <p>
          You can export your shelter plugins and settings to backup and/or import to another shelter instance.
          <Space />
          <strong>Plugin settings may include sensitive data if exported</strong>, be careful.
        </p>
        <div class={classes.exportgrid}>
          <div />
          <div />
          {/*<strong>Include</strong>*/}
          <strong>Export Settings</strong>
          <For each={Object.entries(installedPlugins()).filter(([, p]) => !p.injectorIntegration)}>
            {([id, plugin]) => (
              <>
                <span>{plugin.manifest.name}</span>
                <Checkbox
                  checked={pluginsActive().has(id)}
                  onChange={(v) => {
                    if (v) setPluginsActive((s) => s.add(id));
                    else setPluginsActive((s) => (s.delete(id), s));
                  }}
                />
                <Checkbox
                  disabled={!pluginsActive().has(id)}
                  checked={pluginsActive().has(id) && pluginsSaveData().get(id)}
                  onChange={(v) => setPluginsSaveData((s) => s.set(id, v))}
                />
              </>
            )}
          </For>
        </div>
      </ModalBody>
      <ModalConfirmFooter
        close={close}
        confirmText="Export"
        type="confirm"
        onConfirm={() => {
          const plugins = {};
          for (const active of pluginsActive()) plugins[active] = pluginsSaveData().get(active);

          const exported = exportData(plugins);

          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([JSON.stringify(exported)], { type: "text/json" }));
          a.download = "shelter-export.json";
          a.click();
          URL.revokeObjectURL(a.href);
        }}
      />
    </ModalRoot>
  );
};

export const DataManagement = () => (
  // TODO: when sync is added to this section, make it collapsible.
  <div>
    <Header tag={HeaderTags.EYEBROW}>Data Management</Header>
    <div style={{ display: "grid", "grid-auto-flow": "column", gap: "1rem" }}>
      <Button size={ButtonSizes.SMALL} color={ButtonColors.SECONDARY} grow onClick={() => openModal(ExportModal)}>
        Export Data
      </Button>
      <Button size={ButtonSizes.SMALL} color={ButtonColors.SECONDARY} grow disabled tooltip="WIP!">
        Import Data
      </Button>
      <Button size={ButtonSizes.SMALL} color={ButtonColors.RED} grow disabled tooltip="WIP!">
        Delete All Data
      </Button>
    </div>
  </div>
);
