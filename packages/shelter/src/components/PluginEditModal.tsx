import {
  Header,
  HeaderTags,
  ModalBody,
  ModalConfirmFooter,
  ModalHeader,
  ModalRoot,
  SwitchItem,
  TextArea,
  TextBox,
  Space,
  openModal,
  showToast,
  IconUpload,
} from "@uwu/shelter-ui";
import { Component, createMemo, createSignal, Match, onCleanup, Show, Switch, untrack } from "solid-js";
import {
  addLocalPlugin,
  addRemotePlugin,
  editPlugin,
  installedPlugins,
  startPlugin,
  stopPlugin,
  StoredPlugin,
  updatePlugin,
} from "../plugins";
import { classes } from "./Plugins.tsx.scss";

const JsUploader: Component<{ setCode: (t: string) => void }> = (props) => {
  let inp: HTMLInputElement;

  return (
    <>
      <input
        ref={inp}
        type="file"
        style="display: none"
        accept="text/javascript"
        onChange={() => {
          const f = inp.files[0];
          if (f) {
            const reader = new FileReader();
            reader.readAsText(f);
            reader.onloadend = () => props.setCode(reader.result as string);
          }
        }}
      />
      <button class={classes.btn} onClick={() => inp.click()}>
        <IconUpload />
      </button>
    </>
  );
};

const PluginEditModal = (props: {
  close(): void;
  editId?: string;
  resolve: (s: boolean) => void;
  reject: (e?: any) => void;
}) => {
  onCleanup(() => props.resolve(false));

  const stateInit: StoredPlugin = props.editId
    ? untrack(installedPlugins)[props.editId]
    : {
        local: false,
        on: false,
        js: "",
        update: true,
        src: "",
        manifest: {
          name: "",
          author: "",
          description: "",
        },
      };

  if (!stateInit) {
    props.reject("Cannot edit a plugin that is not installed");
    return [];
  }

  const [local, setLocal] = createSignal(stateInit.local);

  const [rSrc, setRSrc] = createSignal(stateInit.src);
  const [rUpdate, setRUpdate] = createSignal(stateInit.update);

  const [lName, setLName] = createSignal(stateInit.manifest?.name ?? "");
  const [lCode, setLCode] = createSignal(stateInit.js ?? "");
  const [lAuthor, setLAuthor] = createSignal(stateInit.manifest?.author ?? "");
  const [lDesc, setLDesc] = createSignal(stateInit.manifest?.description ?? "");

  const targetId = createMemo(() => {
    if (props.editId) return props.editId;

    if (!local()) return rSrc().split("://")[1];

    let id = lName().toLowerCase().replaceAll(/[^A-Za-z0-9-_.]/g, "-");
    while (id in untrack(installedPlugins)) id += "_";

    return id;
  });

  const validate = () => {
    try {
      new URL(rSrc());
    } catch {
      if (!local()) return false;
    }

    if ((!lName() || !lCode() || !lAuthor()) && local()) return;

    if (props.editId) return targetId() == props.editId;
    else return !(targetId() in untrack(installedPlugins));
  };

  return (
    <ModalRoot>
      <ModalHeader close={props.close}>
        <Show keyed={false} when={props.editId} fallback={"Add plugin"}>
          Edit {lName()}
        </Show>
      </ModalHeader>

      <ModalBody>
        <SwitchItem checked={local()} onChange={setLocal} hideBorder>
          Local plugin
        </SwitchItem>

        <Switch>
          <Match when={!local()} keyed={false}>
            <Header tag={HeaderTags.H4}>URL</Header>
            <TextBox placeholder="https://example.com/my-plugin" value={rSrc()} onInput={setRSrc} />
            <Space />
            <SwitchItem checked={rUpdate()} onChange={setRUpdate} hideBorder>
              Automatically update
            </SwitchItem>
          </Match>

          <Match when={local()} keyed={false}>
            <Header tag={HeaderTags.H4}>Name</Header>
            <TextBox placeholder="My Cool Plugin" value={lName()} onInput={setLName} />
            <Header tag={HeaderTags.H4}>Author</Header>
            <TextBox placeholder="Rin" value={lAuthor()} onInput={setLAuthor} />
            <Header tag={HeaderTags.H4}>Description</Header>
            <TextBox placeholder="The plugin is very cool and helpful" value={lDesc()} onInput={setLDesc} />
            <Header tag={HeaderTags.H4}>Code</Header>

            <div class={classes.tawrap}>
              <JsUploader setCode={setLCode} />
              {/* TODO: monaco */}
              <TextArea
                mono
                style="height: 150px"
                resize-y
                placeholder={`{
  onLoad() {
    const { name } = shelter.plugin.manifest;
    console.log(\`Hello from $\u200C{name}!\`);
  },
  onUnload() {
    console.log("Goodbye :(");
  }
}`}
                value={lCode()}
                onInput={setLCode}
              />
            </div>
          </Match>
        </Switch>
      </ModalBody>

      <ModalConfirmFooter
        close={props.close}
        confirmText={props.editId ? "Edit" : local() ? "Add" : "Fetch"}
        disabled={!validate()}
        onConfirm={async () => {
          try {
            if (props.editId) {
              const wasRunning = stateInit.on;
              if (!local() && wasRunning) {
                stopPlugin(props.editId);
              }

              // edit existing plugin
              editPlugin(props.editId, {
                local: local(),
                js: lCode(),
                update: rUpdate(),
                manifest: {
                  ...stateInit.manifest,
                  hash: !local() && lCode() === stateInit.js ? stateInit.manifest.hash : undefined,
                  name: lName(),
                  author: lAuthor(),
                  description: lDesc(),
                },
                on: stateInit.on,
                src: rSrc(),
              });

              // update if necessary
              if (!local()) await updatePlugin(props.editId);

              if (!local() && wasRunning) startPlugin(props.editId);
            } else if (local()) {
              // create new local plugin
              addLocalPlugin(targetId(), {
                local: true,
                js: lCode(),
                update: rUpdate(),
                manifest: {
                  name: lName(),
                  author: lAuthor(),
                  description: lDesc(),
                },
                on: stateInit.on,
                src: rSrc(),
              });
            } else {
              // create new remote plugin
              await addRemotePlugin(targetId(), rSrc(), rUpdate());
            }
          } catch (e) {
            return props.reject(e);
          }

          props.resolve(true);
        }}
      />
    </ModalRoot>
  );
};
//export default PluginEditModal;

// true - added plugin, false - cancelled or error, errors will show a toast
export const addPluginModal = () =>
  new Promise<boolean>((res) => {
    openModal((props) => (
      <PluginEditModal
        resolve={(r) => {
          if (r)
            showToast({
              title: "Added plugin successfully",
              duration: 3000,
            });

          res(r);
        }}
        reject={(err) => {
          showToast({
            title: "Failed to add plugin",
            content: err?.message ?? err + "",
            duration: 3000,
          });
        }}
        close={props.close}
      />
    ));
  });

// true - added plugin, false - cancelled or error, errors will show a toast
export const editPluginModal = (id: string) =>
  new Promise<boolean>((res) => {
    openModal((props) => (
      <PluginEditModal
        editId={id}
        resolve={(r) => {
          if (r)
            showToast({
              title: "Edited plugin successfully",
              duration: 3000,
            });

          res(r);
        }}
        reject={(err) => {
          showToast({
            title: "Failed to edit plugin",
            content: err?.message ?? err + "",
            duration: 3000,
          });
        }}
        close={props.close}
      />
    ));
  });
