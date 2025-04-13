import {
  Button,
  ButtonColors,
  ButtonSizes,
  Checkbox,
  injectCss,
  ModalBody,
  ModalConfirmFooter,
  ModalHeader,
  ModalRoot,
  openConfirmationModal,
  openModal,
  showToast,
  Space,
} from "@uwu/shelter-ui";
import { DataExport, exportData, importData, importWouldConflict, verifyData } from "../data";
import { installedPlugins } from "../plugins";
import { createSignal, For, Show, untrack } from "solid-js";
import { classes, css } from "./DataManagement.tsx.scss";
import { deleteDB } from "idb";

let injectedCss = false;

export const ExportModal = ({
  close,
  handleExport,
  mode = "export",
}: {
  close: () => void;
  handleExport: (data: DataExport) => Promise<{ error?: string; success?: string }> | void;
  mode?: "export" | "sync";
}) => {
  if (!injectedCss) {
    injectedCss = true;
    injectCss(css);
  }

  const [pluginsActive, setPluginsActive] = createSignal(new Set<string>(), { equals: false });
  const [pluginsSaveData, setPluginsSaveData] = createSignal(new Map<string, boolean>(), { equals: false });
  const [isExporting, setIsExporting] = createSignal(false);

  // all plugins selected by default
  for (const id in untrack(installedPlugins)) {
    pluginsActive().add(id);
    pluginsSaveData().set(id, true);
  }

  const handleExportedData = async () => {
    setIsExporting(true);

    // Close the modal immediately
    close();

    const plugins = {};
    for (const active of pluginsActive()) plugins[active] = pluginsSaveData().get(active);

    const exported = exportData(plugins);

    const isSync = mode === "sync";
    const actionText = isSync ? "Sync" : "Export";

    setTimeout(async () => {
      try {
        const result = await handleExport(exported);
        if (result) {
          if (result.error) {
            showToast({
              title: `${actionText} Failed`,
              content: result.error,
              duration: 3000,
            });
          } else if (result.success) {
            showToast({
              title: `${actionText} Successful`,
              content: result.success,
              duration: 3000,
            });
          }
        } else {
          showToast({
            title: `${actionText} Completed`,
            duration: 3000,
          });
        }
      } catch (error) {
        showToast({
          title: `${actionText} Failed`,
          content: error?.message ?? error + "",
          duration: 3000,
        });
      } finally {
        setIsExporting(false);
      }
    }, 0);
  };

  const handleClose = () => {
    if (!isExporting()) {
      close();
    }
  };

  const isSync = mode === "sync";
  const actionText = isSync ? "Sync" : "Export";
  const actionProgressText = isSync ? "Syncing..." : "Exporting...";

  return (
    <ModalRoot>
      <ModalHeader close={handleClose}>{actionText} Data</ModalHeader>
      <ModalBody>
        <p>
          {isSync ? (
            <>
              You can sync your shelter plugins and settings to your shelter sync account.
              <Space />
              <strong>Plugin settings may include sensitive data when synced</strong>, be careful.
            </>
          ) : (
            <>
              You can export your shelter plugins and settings to backup and/or import to another shelter instance.
              <Space />
              <strong>Plugin settings may include sensitive data if exported</strong>, be careful.
            </>
          )}
        </p>
        <div class={classes.exportgrid}>
          <div />
          <div />
          <strong>{actionText} Settings</strong>
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
        close={handleClose}
        confirmText={isExporting() ? actionProgressText : actionText}
        type="confirm"
        onConfirm={handleExportedData}
        disabled={isExporting()}
      />
    </ModalRoot>
  );
};

const triggerImport = async () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";

  const p = new Promise((r) => (input.onchange = r));

  input.click();
  await p;

  const f = input.files[0];
  if (!f) return;

  const reader = new FileReader();
  reader.readAsText(f);
  await new Promise((r) => (reader.onloadend = r));

  const data = JSON.parse(reader.result as string);

  const verifyResult = verifyData(data);

  if (verifyResult)
    return showToast({
      title: "Data is invalid and so was not imported",
      content: verifyResult,
      duration: 3000,
    });

  if (importWouldConflict(data))
    await openConfirmationModal({
      type: "danger",
      header: () => "Import has conflicts",
      body: () =>
        "Importing this data will overwrite some currently installed plugins.\n" +
        "If the export contains the plugin but without its settings, the existing settings are kept.",
    });

  try {
    importData(data);
  } catch (e) {
    return showToast({
      title: "Error while importing data export",
      content: e?.message ?? e + "",
      duration: 3000,
    });
  }

  showToast({
    title: `Successfully imported ${
      Object.keys(data.localPlugins).length + Object.keys(data.remotePlugins).length
    } plugins and data`,
    duration: 3000,
  });
};

export const LocalDataManagement = () => {
  const handleExport = async (data: DataExport) => {
    try {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }));
      a.download = "shelter-export.json";
      a.click();
      URL.revokeObjectURL(a.href);
      return { success: "Data exported successfully" };
    } catch (error) {
      return { error: `Failed to export data: ${error?.message ?? error + ""}` };
    }
  };

  return (
    <>
      <div style={{ display: "grid", "grid-auto-flow": "column", gap: "1rem" }}>
        <Button
          size={ButtonSizes.SMALL}
          color={ButtonColors.SECONDARY}
          grow
          onClick={() =>
            openModal((props) => <ExportModal mode="export" close={props.close} handleExport={handleExport} />)
          }
        >
          Export Data
        </Button>
        <Button size={ButtonSizes.SMALL} color={ButtonColors.SECONDARY} grow onClick={triggerImport}>
          Import Data
        </Button>
        <Button
          size={ButtonSizes.SMALL}
          color={ButtonColors.RED}
          grow
          onClick={() =>
            openConfirmationModal({
              type: "danger",
              header: () => "Are you sure?",
              body: () =>
                "Are you sure you want to delete all plugins and their data, and 'factory reset' shelter? " +
                "There is absolutely no going back from this. " +
                "This will also unload shelter (until next reload).",
              confirmText: "Reset shelter",
            }).then(() => {
              // will delete the db as soon as connections are closed
              deleteDB("shelter");
              // try to move to a different tab
              (
                document.querySelector("[class*=layers] > :last-child [role=tablist] > div[role=tab]") as HTMLDivElement
              )?.click();
              // unload shelter, delay for modal
              setTimeout(() => window["shelter"].unload(), 250);
            })
          }
        >
          Delete All Data
        </Button>
      </div>
    </>
  );
};
