import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import {
  Button,
  ButtonColors,
  ButtonSizes,
  Header,
  HeaderTags,
  Text,
  TextTags,
  TextWeights,
  Divider,
  Switch,
  SwitchItem,
  Checkbox,
  CheckboxItem,
  TextBox,
  TextArea,
  Slider,
  LinkButton,
  ModalRoot,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalConfirmFooter,
  ModalSizes,
  showToast,
  ToastColors,
  niceScrollbarsClass,
  IconClose,
  focusring,
  tooltip,
  InternalStyles,
  initToasts,
  injectInternalStyles,
} from "@uwu/shelter-ui";

false && focusring;
false && tooltip;

function ShadowIsolatedDemo(props: { children: any }) {
  const stylesCopy = document.getElementById("shltr-styles");
  return (
    <div style={{ "font-family": "var(--font-primary)", color: "var(--text-default)" }}>
      <style>{"input, button, textarea, select { font: inherit; } "}</style>
      {stylesCopy && <style>{stylesCopy.innerHTML}</style>}
      <InternalStyles />
      {props.children}
    </div>
  );
}

function ButtonColorsDemo() {
  return (
    <ShadowIsolatedDemo>
      <div style={{ display: "flex", gap: "8px", "flex-wrap": "wrap" }}>
        <Button color={ButtonColors.PRIMARY} size={ButtonSizes.MIN}>
          Primary
        </Button>
        <Button color={ButtonColors.SECONDARY} size={ButtonSizes.LARGE}>
          Secondary
        </Button>
        <Button color={ButtonColors.CRITICAL_PRIMARY} size={ButtonSizes.LARGE}>
          Critical
        </Button>
        <Button color={ButtonColors.CRITICAL_SECONDARY} size={ButtonSizes.LARGE}>
          Critical Secondary
        </Button>
        <Button color={ButtonColors.ACTIVE} size={ButtonSizes.LARGE}>
          Active
        </Button>
      </div>
    </ShadowIsolatedDemo>
  );
}

function ButtonSizesDemo() {
  return (
    <ShadowIsolatedDemo>
      <div style={{ display: "flex", gap: "8px", "flex-wrap": "wrap", "align-items": "center" }}>
        <Button size={ButtonSizes.TINY}>Tiny</Button>
        <Button size={ButtonSizes.SMALL}>Small</Button>
        <Button size={ButtonSizes.MEDIUM}>Medium</Button>
        <Button size={ButtonSizes.LARGE}>Large</Button>
        <Button size={ButtonSizes.XLARGE}>XLarge</Button>
      </div>
    </ShadowIsolatedDemo>
  );
}

function HeadersDemo() {
  return (
    <ShadowIsolatedDemo>
      <div style={{ display: "flex", "flex-direction": "column", gap: "8px" }}>
        <Header tag={HeaderTags.HeadingXXL}>HeadingXXL</Header>
        <Header tag={HeaderTags.HeadingXL}>HeadingXL</Header>
        <Header tag={HeaderTags.HeadingLG}>HeadingLG</Header>
        <Header tag={HeaderTags.HeadingMD}>HeadingMD</Header>
        <Header tag={HeaderTags.HeadingSM}>HeadingSM</Header>
        <Header tag={HeaderTags.EYEBROW}>EYEBROW</Header>
      </div>
    </ShadowIsolatedDemo>
  );
}

function TextVariantsDemo() {
  return (
    <ShadowIsolatedDemo>
      <div style={{ display: "flex", "flex-direction": "column", gap: "8px" }}>
        <Text tag={TextTags.textXXS}>textXXS</Text>
        <Text tag={TextTags.textXS}>textXS</Text>
        <Text tag={TextTags.textSM}>textSM</Text>
        <Text tag={TextTags.textMD}>textMD (default)</Text>
        <Text tag={TextTags.textLG}>textLG</Text>
        <Text tag={TextTags.messagePreview}>messagePreview</Text>
        <Text tag={TextTags.channelTitle}>channelTitle</Text>
        <Text tag={TextTags.displaySM}>displaySM</Text>
        <Text tag={TextTags.displayMD}>displayMD</Text>
        <Text tag={TextTags.displayLG}>displayLG</Text>
      </div>
    </ShadowIsolatedDemo>
  );
}

function TextWeightsDemo() {
  return (
    <ShadowIsolatedDemo>
      <div style={{ display: "flex", "flex-direction": "column", gap: "4px" }}>
        <Text weight={TextWeights.normal}>Normal (400)</Text>
        <Text weight={TextWeights.medium}>Medium (500)</Text>
        <Text weight={TextWeights.semibold}>Semibold (600)</Text>
        <Text weight={TextWeights.bold}>Bold (700)</Text>
        <Text weight={TextWeights.extrabold}>Extrabold (800)</Text>
      </div>
    </ShadowIsolatedDemo>
  );
}

function DividerDemo() {
  return (
    <ShadowIsolatedDemo>
      <div style={{ width: "100%" }}>
        <Text>Content above</Text>
        <Divider mt mb />
        <Text>Content below</Text>
      </div>
    </ShadowIsolatedDemo>
  );
}

function SwitchDemo() {
  const [checked, setChecked] = createSignal(false);
  return (
    <ShadowIsolatedDemo>
      <div style={{ display: "flex", gap: "16px", "align-items": "center" }}>
        <Switch checked={checked()} onChange={setChecked} />
        <Text>{checked() ? "On" : "Off"}</Text>
      </div>
    </ShadowIsolatedDemo>
  );
}

function SwitchItemDemo() {
  const [checked, setChecked] = createSignal(true);
  return (
    <ShadowIsolatedDemo>
      <SwitchItem checked={checked()} onChange={setChecked} note="This is a helpful description of the option">
        A Cool Option
      </SwitchItem>
    </ShadowIsolatedDemo>
  );
}

function CheckboxDemo() {
  const [checked, setChecked] = createSignal(false);
  return (
    <ShadowIsolatedDemo>
      <div style={{ display: "flex", gap: "16px", "align-items": "center" }}>
        <Checkbox checked={checked()} onChange={setChecked} />
        <Text>{checked() ? "Checked" : "Unchecked"}</Text>
      </div>
    </ShadowIsolatedDemo>
  );
}

function CheckboxItemDemo() {
  const [checked, setChecked] = createSignal(true);
  return (
    <ShadowIsolatedDemo>
      <CheckboxItem checked={checked()} onChange={setChecked}>
        Accept terms and conditions
      </CheckboxItem>
    </ShadowIsolatedDemo>
  );
}

function TextboxDemo() {
  const [value, setValue] = createSignal("");
  return (
    <ShadowIsolatedDemo>
      <TextBox placeholder="Type something..." value={value()} onInput={setValue} />
    </ShadowIsolatedDemo>
  );
}

function TextareaDemo() {
  const [value, setValue] = createSignal("");
  return (
    <ShadowIsolatedDemo>
      <TextArea
        placeholder="Type a longer message..."
        value={value()}
        onInput={setValue}
        resize-y
        style={{ width: "100%", "min-height": "100px" }}
      />
    </ShadowIsolatedDemo>
  );
}

function SliderDemo() {
  const [value, setValue] = createSignal(5);
  return (
    <ShadowIsolatedDemo>
      <div style={{ width: "100%" }}>
        <Slider min={0} max={10} step={1} tick value={value()} onInput={setValue} />
      </div>
    </ShadowIsolatedDemo>
  );
}

function ModalDemo() {
  return (
    <ShadowIsolatedDemo>
      <div style={{ position: "relative" }}>
        <ModalRoot size={ModalSizes.SMALL} style={{ position: "relative", "max-width": "100%" }}>
          <ModalHeader close={() => {}} noClose>
            Modal Header
          </ModalHeader>
          <ModalBody>This is the modal body content. You can put anything here!</ModalBody>
          <ModalFooter>
            <Button color={ButtonColors.PRIMARY}>Action</Button>
          </ModalFooter>
        </ModalRoot>
      </div>
    </ShadowIsolatedDemo>
  );
}

function ConfirmFooterDemo() {
  return (
    <ShadowIsolatedDemo>
      <div style={{ display: "flex", "flex-direction": "column", gap: "12px" }}>
        <Text weight={TextWeights.semibold}>Neutral:</Text>
        <ModalConfirmFooter close={() => {}} type="neutral" />
        <Text weight={TextWeights.semibold}>Danger:</Text>
        <ModalConfirmFooter close={() => {}} type="danger" />
        <Text weight={TextWeights.semibold}>Confirm:</Text>
        <ModalConfirmFooter close={() => {}} type="confirm" />
      </div>
    </ShadowIsolatedDemo>
  );
}

function LinkButtonDemo() {
  return (
    <ShadowIsolatedDemo>
      <LinkButton href="https://github.com/uwu/shelter">Visit shelter on GitHub</LinkButton>
    </ShadowIsolatedDemo>
  );
}

function ToastDemo() {
  injectInternalStyles();
  initToasts(document.body);

  return (
    <ShadowIsolatedDemo>
      <div style={{ display: "flex", gap: "8px", "flex-wrap": "wrap" }}>
        <Button
          color={ButtonColors.PRIMARY}
          onClick={() =>
            showToast({
              title: "Info Toast",
              content: "This is the default toast style",
              color: ToastColors.INFO,
            })
          }
        >
          Info
        </Button>
        <Button
          color={ButtonColors.ACTIVE}
          onClick={() =>
            showToast({
              title: "Success Toast",
              content: "Button clicked successfully. Good job!",
              color: ToastColors.SUCCESS,
            })
          }
        >
          Success
        </Button>
        <Button
          color={ButtonColors.SECONDARY}
          onClick={() =>
            showToast({
              title: "Warning Toast",
              content: "Something went wrong, but we can still recover",
              color: ToastColors.WARNING,
            })
          }
        >
          Warning
        </Button>
        <Button
          color={ButtonColors.CRITICAL_PRIMARY}
          onClick={() =>
            showToast({
              title: "Critical Toast",
              content: "Use this when you have a fucky wucky",
              color: ToastColors.CRITICAL,
            })
          }
        >
          Critical
        </Button>
      </div>
    </ShadowIsolatedDemo>
  );
}

function ScrollbarDemo() {
  return (
    <ShadowIsolatedDemo>
      <div
        class={niceScrollbarsClass()}
        style={{
          height: "150px",
          overflow: "auto",
          padding: "8px",
          border: "1px solid var(--border-subtle)",
          "border-radius": "var(--radius-md)",
          background: "var(--input-background-default)",
        }}
      >
        <Text>Scroll down for a secret</Text>
        <div style={{ height: "300px", display: "flex", "align-items": "end" }}>
          <Text>:3</Text>
        </div>
      </div>
    </ShadowIsolatedDemo>
  );
}

function FocusringDemo() {
  return (
    <ShadowIsolatedDemo>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          use:focusring
          style={{
            background: "#304050",
            border: "1px solid #80208050",
            "border-radius": "var(--radius-md)",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          Custom button with focusring
        </button>
      </div>
    </ShadowIsolatedDemo>
  );
}

function TooltipDemo() {
  return (
    <ShadowIsolatedDemo>
      <div style={{ display: "flex", gap: "8px" }}>
        <button use:tooltip="Delete" style={{ background: "transparent", border: "none", cursor: "pointer" }}>
          <IconClose />
        </button>
        <button
          use:tooltip={[true, "Delete but underneath"]}
          style={{ background: "transparent", border: "none", cursor: "pointer" }}
        >
          <IconClose />
        </button>
      </div>
    </ShadowIsolatedDemo>
  );
}

const demos: Record<string, () => any> = {
  "button-colors": ButtonColorsDemo,
  "button-sizes": ButtonSizesDemo,
  headers: HeadersDemo,
  "text-variants": TextVariantsDemo,
  "text-weights": TextWeightsDemo,
  divider: DividerDemo,
  switch: SwitchDemo,
  "switch-item": SwitchItemDemo,
  checkbox: CheckboxDemo,
  "checkbox-item": CheckboxItemDemo,
  textbox: TextboxDemo,
  textarea: TextareaDemo,
  slider: SliderDemo,
  modal: ModalDemo,
  "confirm-footer": ConfirmFooterDemo,
  "link-button": LinkButtonDemo,
  toast: ToastDemo,
  scrollbar: ScrollbarDemo,
  focusring: FocusringDemo,
  tooltip: TooltipDemo,
};

class ShelterDemoElement extends HTMLElement {
  private dispose?: () => void;
  private demoName: string = "";

  connectedCallback() {
    this.demoName = this.getAttribute("demo") || "";
    this.renderDemo();
  }

  disconnectedCallback() {
    this.dispose?.();
  }

  private renderDemo() {
    const Demo = demos[this.demoName];
    if (!Demo) {
      this.textContent = `Unknown demo: ${this.demoName}`;
      return;
    }

    const shadow = this.attachShadow({ mode: "open" });

    this.dispose = render(() => <Demo />, shadow);
  }
}

if (!customElements.get("shelter-demo")) {
  customElements.define("shelter-demo", ShelterDemoElement);
}

export function renderDemo(demoName: string, container: HTMLElement): () => void {
  const demoEl = document.createElement("shelter-demo");
  demoEl.setAttribute("demo", demoName);
  container.appendChild(demoEl);

  return () => {
    demoEl.remove();
  };
}

export type DemoName = keyof typeof demos;
