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
} from "@uwu/shelter-ui";
import { createSignal, Match, Switch } from "solid-js";
import { addLocalPlugin, addRemotePlugin, installedPlugins } from "../plugins";

export default (props: { close(): void }) => {
  const [local, setLocal] = createSignal(false);

  const [rSrc, setRSrc] = createSignal("");
  const [rUpdate, setRUpdate] = createSignal(true);

  const [lName, setLName] = createSignal("");
  const [lCode, setLCode] = createSignal("");
  const [lAuthor, setLAuthor] = createSignal("");
  const [lDesc, setLDesc] = createSignal("");

  const newId = () => {
    if (!local()) return rSrc().split("://")[1];

    let id = lName().toLowerCase().replaceAll(/[^A-Za-z0-9-_.]/g, "-");
    while (id in installedPlugins()) id += "_";

    return id;
  };

  const validate = () => {
    try {
      new URL(rSrc());
    } catch {
      if (!local()) return false;
    }

    if ((!lName() || !lCode() || !lAuthor()) && local()) return;

    return !(newId() in installedPlugins());
  };

  return (
    <ModalRoot>
      <ModalHeader close={props.close}>Add plugin</ModalHeader>

      <ModalBody>
        <SwitchItem value={local()} onChange={setLocal} hideBorder>
          Local plugin
        </SwitchItem>

        <Switch>
          <Match when={!local()} keyed={false}>
            <Header tag={HeaderTags.H4}>URL</Header>
            <TextBox placeholder="https://example.com/my-plugin" value={rSrc()} onInput={setRSrc} />
            <Space />
            <SwitchItem value={rUpdate()} onChange={setRUpdate} hideBorder>
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
            {/* TODO: monaco */}
            <TextArea
              mono
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
          </Match>
        </Switch>
      </ModalBody>

      <ModalConfirmFooter
        close={props.close}
        confirmText={local() ? "Add" : "Fetch"}
        disabled={!validate()}
        onConfirm={async () => {
          if (local()) {
            try {
              addLocalPlugin(newId(), {
                js: lCode(),
                manifest: {
                  name: lName(),
                  author: lAuthor(),
                  description: lDesc(),
                },
                on: false,
                update: false,
              });
              // TODO: toasts
            } catch (e) {}
          } else {
            try {
              await addRemotePlugin(newId(), rSrc(), rUpdate());
            } catch (e) {}
          }
        }}
      />
    </ModalRoot>
  );
};
