import { Header, HeaderTags, ModalBody, ModalConfirmFooter, ModalHeader, ModalRoot, SwitchItem } from "shelter-ui";
import { Component, createSignal, Match, Switch } from "solid-js";
import { installedPlugins } from "../plugins";

// TODO: discord input component
const TextBox: Component<{
  placeholder: string;
  signal: [() => string, (v: string) => void];
}> = (props) => (
  <input
    placeholder={props.placeholder}
    type="text"
    value={props.signal[0]()}
    onInput={(e) => props.signal[1]((e.target as HTMLInputElement).value)}
  />
);

export default (props: { close(): void }) => {
  const [local, setLocal] = createSignal(false);

  const [rSrc, setRSrc] = createSignal("");
  const [lName, setLName] = createSignal("");
  const [lCode, setLCode] = createSignal("");
  const [lAuthor, setLAuthor] = createSignal("");

  const newId = () => {
    if (!local()) return rSrc().split("://")[1];

    let id = lName()
      .toLowerCase()
      .replaceAll(/[^A-Za-z0-9-_.]/g, "-");
    while (installedPlugins[id]) id += "_";

    return id;
  };

  const validate = () => {
    try {
      new URL(rSrc());
    } catch {
      if (!local()) return false;
    }

    if ((!lName() || !lCode() || !lAuthor()) && local()) return;

    return !installedPlugins[newId()];
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
            <TextBox placeholder="https://example.com/my-plugin" signal={[rSrc, setRSrc]} />
          </Match>
          <Match when={local()} keyed={false}>
            <Header tag={HeaderTags.H4}>Name</Header>
            <TextBox placeholder="My Cool Plugin" signal={[lName, setLName]} />
            <Header tag={HeaderTags.H4}>Author</Header>
            <TextBox placeholder="Rin" signal={[lAuthor, setLAuthor]} />
            <Header tag={HeaderTags.H4}>Code</Header>
            {/* TODO: monaco */}
            <textarea
              style="font-family: monospace"
              placeholder={`{
  onload() {
    const { name } = shelter.plugin.manifest;
    console.log(\`Hello from $\u200C{name}!\`);
  },
  onUnload() {
    console.log("Goodbye :(");
  }
}`}
              value={lCode()}
              onInput={(e) => setLCode((e.target as HTMLTextAreaElement).value)}
            />
          </Match>
        </Switch>
      </ModalBody>

      <ModalConfirmFooter
        close={props.close}
        confirmText={local() ? "Add" : "Fetch"}
        disabled={!validate()}
        onConfirm={() => {
          console.log("//TODO");
        }}
      />
    </ModalRoot>
  );
};
