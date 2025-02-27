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
import { authorize, defaultApiUrl, getAuthCode, getSyncURL, store, unauthorize } from "../sync";
import { createSignal } from "solid-js";
import { signalOf } from "../storage";
import { ExportModal } from "./DataManagement";
import { DataExport } from "../data";

const sig = signalOf(store);

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

  const handleConfirm = () => {
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
        onConfirm={handleConfirm}
      />
    </ModalRoot>
  );
};

export const SyncMangement = () => {
  const handleExport = async (data: DataExport) => {
    const request = await fetch(new URL("/settings", getSyncURL()), {
      method: "PUT",
      headers: {
        Authorization: getAuthCode(),
        "Content-Type": "application/octet-stream",
      },
      body: JSON.stringify(data),
    });

    if (!request.ok) {
      showToast({
        title: "Error while syncing data",
        content: `${request.status}: ${request.statusText}`,
        duration: 3000,
      });
    }

    showToast({
      title: "Data synced successfully",
      duration: 3000,
    });
  };

  return (
    <>
      <Header tag={HeaderTags.EYEBROW}>Sync</Header>
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
          onClick={() => openModal((props) => <ExportModal close={props.close} handleExport={handleExport} />)}
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
                "Are you sure you want to delete synchronized data for all plugins and your user profile? This is irreversible.",
              confirmText: "Reset",
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

export const UnauthorizeModal = ({ close }: { close: () => void }) => {
  const handleUnauthorize = () => {
    unauthorize();
    close();
  };

  return (
    <ModalRoot size={ModalSizes.SMALL}>
      <ModalHeader close={close}>Unauthorize</ModalHeader>
      <ModalBody>Are you sure you want to unauthorize? This will log you out of shelter sync.</ModalBody>
      <ModalConfirmFooter close={close} type="danger" onConfirm={handleUnauthorize} />
    </ModalRoot>
  );
};
