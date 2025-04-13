import {
  ModalRoot,
  ModalHeader,
  ModalBody,
  ModalConfirmFooter,
  ModalSizes,
  openConfirmationModal,
  Button,
  openModal,
  ButtonSizes,
  ButtonColors,
  Divider,
  TextBox,
  HeaderTags,
  Header,
  showToast,
} from "@uwu/shelter-ui";
import { authorize, defaultApiUrl, getAuthCode, getSyncURL, syncStore, unauthorize } from "../sync";
import { createSignal, Show } from "solid-js";
import { signalOf } from "../storage";
import { ExportModal } from "./DataManagement";
import { DataExport, importData, importWouldConflict, verifyData } from "../data";
import Alert from "./Alert";
import { installedPlugins } from "../plugins";

const sig = signalOf(syncStore);

const toast = (content: string) =>
  showToast({
    title: "Sync",
    content,
    duration: 3000,
  });

const handlePutData = async (data: DataExport) => {
  try {
    const request = await fetch(new URL("/settings", getSyncURL()), {
      method: "PUT",
      headers: {
        Authorization: getAuthCode(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!request.ok) {
      return { error: `Error while syncing data: ${request.status}: ${request}` };
    }

    const { lastUpdated } = await request.json();
    syncStore.syncLastUpdated = lastUpdated;

    return { success: "Data synced successfully!" };
  } catch (error) {
    return { error: error?.message ?? error + "" };
  }
};

const handlePullData = async () => {
  const request = await fetch(new URL("/settings", getSyncURL()), {
    method: "GET",
    headers: {
      Authorization: getAuthCode(),
      Accept: "application/json",
      "If-None-Match": sig().syncLastUpdated,
    },
  });

  if (request.status === 404) {
    return toast("No data exists on the server to pull.");
  }

  if (request.status === 304) {
    return toast("Up to date!");
  }

  if (!request.ok) {
    return toast(`Error while fetching data: ${request.status}: ${request.statusText}`);
  }

  const written = Number(request.headers.get("etag")!);
  const localWritten = sig().syncLastUpdated;

  // No need to check for `written > localWritten` because the server will return 304 from if-none-match header.
  if (written < localWritten) {
    return toast("Your local settings are newer than the cloud ones.");
  }

  let settings;
  try {
    settings = await request.json();
  } catch (e) {
    return toast(`Error while parsing response data: ${e?.message ?? e + ""}`);
  }

  const verifyResult = verifyData(settings);

  if (verifyResult)
    return showToast({
      title: "Data is invalid and so was not imported",
      content: verifyResult,
      duration: 3000,
    });

  const conflicts = [];
  for (const id in settings.localPlugins) {
    if (id in installedPlugins()) {
      conflicts.push(`Local plugin: ${id}`);
    }
  }

  for (const src in settings.remotePlugins) {
    for (const p of Object.values(installedPlugins())) {
      if (src == p.src) {
        conflicts.push(`Remote plugin: ${src}`);
      }
    }
  }

  if (conflicts.length) {
    return showToast({
      title: "Conflicting plugins",
      content: conflicts.join("\n"),
      duration: 3000,
    });
  }

  if (importWouldConflict(settings))
    await openConfirmationModal({
      type: "danger",
      header: () => "Pull has conflicts",
      body: () =>
        "Pulling this data will overwrite some currently installed plugins.\n" +
        "If the export contains the plugin but without its settings, the existing settings are kept.",
    });

  try {
    importData(settings);
  } catch (e) {
    return toast(`Error while pulling data: ${e?.message ?? e + ""}`);
  }

  toast(
    `Successfully pulled ${
      Object.keys(settings.localPlugins).length + Object.keys(settings.remotePlugins).length
    } plugins and data`,
  );

  return;
};

const handleResetData = async () => {
  openConfirmationModal({
    type: "danger",
    header: () => "Are you sure?",
    body: () =>
      `Are you sure you want to delete synchronized data for all plugins and your user profile (${
        getSyncURL().origin
      })? This is irreversible.`,
    confirmText: "Reset",
  }).then(async () => {
    const request = await fetch(new URL("/settings", getSyncURL()), {
      method: "DELETE",
      headers: {
        Authorization: getAuthCode(),
      },
    });

    if (!request.ok) {
      return toast(`Error while resetting data: ${request.status}: ${request.statusText}`);
    }

    unauthorize();

    toast("Data reset successfully!");
  });
};

export const SyncMangement = () => {
  const handleSync = () =>
    openModal((props) => <ExportModal mode="sync" close={props.close} handleExport={handlePutData} />);

  // Format the last updated date if it exists
  const formatLastUpdated = () => {
    const timestamp = sig().syncLastUpdated;
    if (!timestamp) return "Never";

    const date = new Date(Number(timestamp));
    return date.toLocaleString();
  };

  return (
    <>
      <Show when={sig().syncIsAuthed}>
        <div style={{ "margin-bottom": "1rem", "font-size": "0.9rem", color: "var(--text-muted)" }}>
          <div>
            <span style={{ "font-weight": "bold" }}>API:</span> {getSyncURL().origin}
          </div>
          <div>
            <span style={{ "font-weight": "bold" }}>Last Updated:</span> {formatLastUpdated()}
          </div>
        </div>
      </Show>

      <div style={{ display: "grid", "grid-auto-flow": "column", gap: "1rem" }}>
        <Button
          size={ButtonSizes.SMALL}
          color={sig().syncIsAuthed ? ButtonColors.RED : ButtonColors.BRAND}
          grow
          onClick={() =>
            openModal((props) =>
              sig().syncIsAuthed ? <UnauthorizeModal close={props.close} /> : <AuthorizeModal close={props.close} />,
            )
          }
        >
          {sig().syncIsAuthed ? "Unauthorize" : "Authorize"}
        </Button>
        <Button
          size={ButtonSizes.SMALL}
          color={ButtonColors.SECONDARY}
          disabled={!sig().syncIsAuthed}
          grow
          onClick={handleSync}
        >
          Sync Data
        </Button>
        <Button
          size={ButtonSizes.SMALL}
          color={ButtonColors.SECONDARY}
          disabled={!sig().syncIsAuthed}
          grow
          onClick={handlePullData}
        >
          Pull Data
        </Button>
        <Button
          size={ButtonSizes.SMALL}
          color={ButtonColors.RED}
          disabled={!sig().syncIsAuthed}
          grow
          onClick={handleResetData}
        >
          Reset Data
        </Button>
      </div>
    </>
  );
};

const AuthorizeModal = ({ close }: { close: () => void }) => {
  const [secret, setSecret] = createSignal("");
  const [apiUrl, setApiUrl] = createSignal(defaultApiUrl);
  const [disabled, setDisabled] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);

  const handleAuth = async () => {
    setDisabled(true);
    setError(null);
    setSuccess(null);

    try {
      const request = await fetch(new URL("/oauth/settings", apiUrl()));

      if (!request.ok) {
        setError(`Error while checking sync backend: ${request.status}: ${request.statusText}`);
        setDisabled(false);
        return;
      }

      const data = await request.json();

      if (!data.redirect_uri || !data.client_id) {
        setError(`${apiUrl()} does not return the required configuration while checking`);
        setDisabled(false);
        return;
      }

      const authURL = new URL("https://discord.com/oauth2/authorize");
      authURL.searchParams.set("client_id", data.client_id);
      authURL.searchParams.set("response_type", "code");
      authURL.searchParams.set("redirect_uri", data.redirect_uri);
      authURL.searchParams.set("scope", "identify");

      window.open(authURL, "_blank");
      setSuccess("Please authorize in your browser in order to continue.");
    } catch (error) {
      setError(error?.message ?? error + "");
    } finally {
      setDisabled(false);
    }
  };

  const handleConfirm = () => {
    syncStore.syncApiUrl = apiUrl();
    authorize(secret().trim());
    close();
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
        <Show when={error()}>
          <Alert type="danger">{error()}</Alert>
        </Show>
        <Show when={success()}>
          <Alert type="success">{success()}</Alert>
        </Show>
        <Header tag={HeaderTags.H5}>API URL</Header>
        <TextBox
          disabled={disabled()}
          placeholder="Enter API URL"
          value={apiUrl()}
          onInput={setApiUrl}
          spellcheck={false}
        />
        <Divider mt="0.25rem" />
        <Header tag={HeaderTags.H5}>1. Authorize via your web browser, and copy the token</Header>
        <Button style={{ width: "100%" }} disabled={disabled()} onClick={handleAuth}>
          Authorize
        </Button>
        <Divider mt="0.25rem" />
        <Header tag={HeaderTags.H5}>2. Paste the secret into the textbox</Header>
        <TextBox type="password" placeholder="secret code" value={secret()} onInput={setSecret} disabled={disabled()} />
      </div>
      <ModalConfirmFooter
        disabled={disabled() || !secret().trim()}
        type="neutral"
        close={close}
        onConfirm={handleConfirm}
      />
    </ModalRoot>
  );
};

const UnauthorizeModal = ({ close }: { close: () => void }) => {
  const [disabled, setDisabled] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const handleUnauthorize = () => {
    setDisabled(true);
    setError(null);

    try {
      unauthorize();
      close();
    } catch (error) {
      setError("Could not unauthorize: " + (error?.message ?? error + ""));
    } finally {
      setDisabled(false);
    }
  };

  return (
    <ModalRoot size={ModalSizes.SMALL}>
      <ModalHeader close={close}>Unauthorize</ModalHeader>
      <ModalBody>
        Are you sure you want to unauthorize? This will log you out of shelter sync ({getSyncURL().origin}).
        <Show when={error()}>
          <Alert type="danger">{error()}</Alert>
        </Show>
      </ModalBody>
      <ModalConfirmFooter close={close} type="danger" onConfirm={handleUnauthorize} disabled={disabled()} />
    </ModalRoot>
  );
};
