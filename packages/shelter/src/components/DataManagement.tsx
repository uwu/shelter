import {
  Button,
  ButtonColors,
  ButtonLooks,
  ButtonSizes,
  Checkbox,
  Divider,
  Header,
  HeaderTags,
  injectCss,
  ModalBody,
  ModalConfirmFooter,
  ModalHeader,
  ModalRoot,
  ModalSizes,
  openConfirmationModal,
  openModal,
  showToast,
  Space,
  TextBox,
} from "@uwu/shelter-ui";
import { exportData, importData, importWouldConflict, verifyData } from "../data";
import { installedPlugins } from "../plugins";
import { createEffect, createSignal, For, untrack } from "solid-js";
import { classes, css } from "./DataManagement.tsx.scss";
import { deleteDB } from "idb";
import { defaults, signalOf, storage } from "../storage";
import { authorize, defaultApiUrl, getAuthCode, getSyncURL } from "../sync";

let injectedCss = false;
export const store = storage("sync");
defaults(store, {
  syncIsAuthed: false,
});
const sig = signalOf(store);

export const ExportModal = ({ close, mode }: { close: () => void; mode: "local" | "sync" }) => {
  if (!injectedCss) {
    injectedCss = true;
    injectCss(css);
  }

  const [pluginsActive, setPluginsActive] = createSignal(new Set<string>(), { equals: false });
  const [pluginsSaveData, setPluginsSaveData] = createSignal(new Map<string, boolean>(), { equals: false });

  const actionText = mode === "local" ? "export" : "sync";

  // all plugins selected by default
  for (const id in untrack(installedPlugins)) {
    pluginsActive().add(id);
    pluginsSaveData().set(id, true);
  }

  const handleExport = () => {
    const plugins = {};
    for (const active of pluginsActive()) plugins[active] = pluginsSaveData().get(active);

    const exported = exportData(plugins);

    if (mode === "local") {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(exported)], { type: "application/json" }));
      a.download = "shelter-export.json";
      a.click();
      URL.revokeObjectURL(a.href);
    } else {
      // TODO: Implement sync export logic
      console.log("Sync export data:", exported);
    }
  };

  return (
    <ModalRoot>
      <ModalHeader close={close}>{actionText} Data</ModalHeader>
      <ModalBody>
        <p>
          You can {actionText} your shelter plugins and settings to backup and/or import to another shelter instance.
          <Space />
          <strong>Plugin settings may include sensitive data if {actionText}</strong>, be careful.
        </p>
        <div class={classes.exportgrid}>
          <div />
          <div />
          {/*<strong>Include</strong>*/}
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
      <ModalConfirmFooter close={close} confirmText={actionText} type="confirm" onConfirm={handleExport} />
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

const AuthorizeModal = ({ close }: { close: () => void }) => {
  // TODO: Needs lots of checks
  const [secret, setSecret] = createSignal("");
  const [apiUrl, setApiUrl] = createSignal(defaultApiUrl);
  const [disabled, setDisabled] = createSignal(false);

  const handleAuth = async () => {
    // 1. flow of operations, the user clicks authorize and then we check if its a real backend
    // then, we construct the discord authURL to pass to open(...)
    // the user get a secret in their browser and then they paste that in the textarea and hit confirm to save
    setDisabled(true);

    // Check if the backend is ok or not
    try {
      const request = await fetch(new URL("/oauth/settings", apiUrl()));

      if (!request.ok) {
        showToast({
          title: "Error while checking sync backend",
          content: `${request.status}: ${request.statusText}`,
          duration: 3000,
        });
        setDisabled(false);
      }

      const data = await request.json();

      if (!data.redirect_uri || !data.client_id) {
        showToast({
          title: "This does not look like a sync backend",
          content: `${apiUrl()} does not return the required configuration while checking`,
          duration: 3000,
        });
        setDisabled(false);
      }

      // Construct the discord oauth URL
      const authURL = new URL("https://discord.com/oauth2/authorize");
      authURL.searchParams.set("client_id", data.client_id);
      authURL.searchParams.set("response_type", "code");
      authURL.searchParams.set("redirect_uri", data.redirect_uri);
      authURL.searchParams.set("scope", "identify");

      open(authURL, "_blank");
      showToast({
        title: "Opened authorization url",
        content: "Please authorize in order to continue.",
      });
    } catch (error) {
      showToast({
        title: "Error while authorizing",
        content: error?.message ?? error + "",
        duration: 3000,
      });
    } finally {
      setDisabled(false);
    }
  };

  return (
    <ModalRoot size={ModalSizes.SMALL}>
      <ModalHeader close={close}>Authorize</ModalHeader>
      <div
        style={{
          display: "flex",
          "flex-direction": "column",
          gap: "0.25rem",
          padding: "16px",
          "padding-top": 0,
        }}
      >
        <Header tag={HeaderTags.H5}>API URL</Header>
        <TextBox disabled={disabled()} placeholder="Enter API URL" value={apiUrl()} onInput={setApiUrl} />
        <Divider mt="0.25rem" />
        <Header tag={HeaderTags.H5}>1. Authorize via your web browser, and copy the token</Header>
        <Button style={{ width: "100%" }} disabled={disabled()} onClick={handleAuth}>
          Authorize
        </Button>
        <Divider mt="0.25rem" />
        <Header tag={HeaderTags.H5}>2. Paste the secret into the textbox</Header>
        <TextBox placeholder="secret code" value={secret()} onInput={setSecret} disabled={disabled()} />
      </div>
      <ModalConfirmFooter
        disabled={disabled() || !secret().trim()}
        type="neutral"
        close={close}
        onConfirm={() => authorize(secret().trim())}
      />
    </ModalRoot>
  );
};

const SyncMangement = () => {
  return (
    <>
      <Header tag={HeaderTags.EYEBROW}>Sync</Header>
      <div style={{ display: "grid", "grid-auto-flow": "column", gap: "1rem" }}>
        <Button
          size={ButtonSizes.SMALL}
          color={sig().syncIsAuthed ? ButtonColors.RED : ButtonColors.BRAND}
          grow
          onClick={() => openModal(AuthorizeModal)}
        >
          {sig().syncIsAuthed ? "Unauthorize" : "Authorize"}
        </Button>
        <Button
          size={ButtonSizes.SMALL}
          color={ButtonColors.SECONDARY}
          disabled={!sig().syncIsAuthed}
          grow
          onClick={() => openModal((props) => <ExportModal close={props.close} mode="sync" />)}
        >
          Sync Data
        </Button>
        <Button
          size={ButtonSizes.SMALL}
          color={ButtonColors.SECONDARY}
          disabled={!sig().syncIsAuthed}
          grow
          onClick={() => {
            /** no-op */
          }}
        >
          Pull Data
        </Button>
        <Button
          size={ButtonSizes.SMALL}
          color={ButtonColors.RED}
          disabled={!sig().syncIsAuthed}
          grow
          onClick={() => {
            openConfirmationModal({
              type: "danger",
              header: () => "Are you sure?",
              body: () =>
                "Are you sure you want to delete synced all plugins and their data, including your user profile?" +
                "This is irreversible.",
              confirmText: "Reset sync data",
            }).then(() => {
              /** // TODO: work logic */
            });
          }}
        >
          Reset Data
        </Button>
      </div>
    </>
  );
};

const LocalDataManagement = () => (
  <>
    <Header tag={HeaderTags.EYEBROW}>Data Management</Header>
    <div style={{ display: "grid", "grid-auto-flow": "column", gap: "1rem" }}>
      <Button
        size={ButtonSizes.SMALL}
        color={ButtonColors.SECONDARY}
        grow
        onClick={() => openModal((props) => <ExportModal close={props.close} mode="local" />)}
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

export const DataManagement = () => (
  // TODO: when sync is added to this section, make it collapsible.
  <div>
    <LocalDataManagement />
    <Space />
    <SyncMangement />
  </div>
);
