import { createSignal, lazy, type Component } from "solid-js";
import { render } from "solid-js/web";
import compatCss from "virtual:compat-css";
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

// CSS for shadow DOM isolation
const baseCss = `
  :host {
    display: block;
    font-family: var(--font-primary);
    color: var(--text-default);
  }
  input, button, textarea, select {
    font: inherit;
  }
`;

// Create a stylesheet that can be adopted by shadow roots
let cachedStyleSheet: CSSStyleSheet | null = null;
function getStyleSheet(): CSSStyleSheet {
  if (!cachedStyleSheet) {
    cachedStyleSheet = new CSSStyleSheet();
    cachedStyleSheet.replaceSync(baseCss + "\n" + compatCss);
  }
  return cachedStyleSheet;
}

function ShadowWrapper(props: { children: any }) {
  return (
    <>
      <InternalStyles />
      {props.children}
    </>
  );
}

// Demo components
function ButtonColorsDemo() {
  return (
    <ShadowWrapper>
      <div style={{ display: "flex", gap: "8px", "flex-wrap": "wrap" }}>
        <Button color={ButtonColors.PRIMARY} size={ButtonSizes.LARGE}>
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
    </ShadowWrapper>
  );
}

function ButtonSizesDemo() {
  return (
    <ShadowWrapper>
      <div style={{ display: "flex", gap: "8px", "flex-wrap": "wrap", "align-items": "center" }}>
        <Button size={ButtonSizes.TINY}>Tiny</Button>
        <Button size={ButtonSizes.SMALL}>Small</Button>
        <Button size={ButtonSizes.MEDIUM}>Medium</Button>
        <Button size={ButtonSizes.LARGE}>Large</Button>
        <Button size={ButtonSizes.XLARGE}>XLarge</Button>
      </div>
    </ShadowWrapper>
  );
}

function HeadersDemo() {
  return (
    <ShadowWrapper>
      <div style={{ display: "flex", "flex-direction": "column", gap: "8px" }}>
        <Header tag={HeaderTags.HeadingXXL}>HeadingXXL</Header>
        <Header tag={HeaderTags.HeadingXL}>HeadingXL</Header>
        <Header tag={HeaderTags.HeadingLG}>HeadingLG</Header>
        <Header tag={HeaderTags.HeadingMD}>HeadingMD</Header>
        <Header tag={HeaderTags.HeadingSM}>HeadingSM</Header>
        <Header tag={HeaderTags.EYEBROW}>EYEBROW</Header>
      </div>
    </ShadowWrapper>
  );
}

function TextVariantsDemo() {
  return (
    <ShadowWrapper>
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
    </ShadowWrapper>
  );
}

function TextWeightsDemo() {
  return (
    <ShadowWrapper>
      <div style={{ display: "flex", "flex-direction": "column", gap: "4px" }}>
        <Text weight={TextWeights.normal}>Normal (400)</Text>
        <Text weight={TextWeights.medium}>Medium (500)</Text>
        <Text weight={TextWeights.semibold}>Semibold (600)</Text>
        <Text weight={TextWeights.bold}>Bold (700)</Text>
        <Text weight={TextWeights.extrabold}>Extrabold (800)</Text>
      </div>
    </ShadowWrapper>
  );
}

function DividerDemo() {
  return (
    <ShadowWrapper>
      <div style={{ width: "100%" }}>
        <Text>Content above</Text>
        <Divider mt mb />
        <Text>Content below</Text>
      </div>
    </ShadowWrapper>
  );
}

function SwitchDemo() {
  const [checked, setChecked] = createSignal(false);
  return (
    <ShadowWrapper>
      <div style={{ display: "flex", gap: "16px", "align-items": "center" }}>
        <Switch checked={checked()} onChange={setChecked} />
        <Text>{checked() ? "On" : "Off"}</Text>
      </div>
    </ShadowWrapper>
  );
}

function SwitchItemDemo() {
  const [checked, setChecked] = createSignal(true);
  return (
    <ShadowWrapper>
      <SwitchItem checked={checked()} onChange={setChecked} note="This is a helpful description of the option">
        A Cool Option
      </SwitchItem>
    </ShadowWrapper>
  );
}

function CheckboxDemo() {
  const [checked, setChecked] = createSignal(false);
  return (
    <ShadowWrapper>
      <div style={{ display: "flex", gap: "16px", "align-items": "center" }}>
        <Checkbox checked={checked()} onChange={setChecked} />
        <Text>{checked() ? "Checked" : "Unchecked"}</Text>
      </div>
    </ShadowWrapper>
  );
}

function CheckboxItemDemo() {
  const [checked, setChecked] = createSignal(true);
  return (
    <ShadowWrapper>
      <CheckboxItem checked={checked()} onChange={setChecked}>
        Accept terms and conditions
      </CheckboxItem>
    </ShadowWrapper>
  );
}

function TextboxDemo() {
  const [value, setValue] = createSignal("");
  return (
    <ShadowWrapper>
      <TextBox placeholder="Type something..." value={value()} onInput={setValue} />
    </ShadowWrapper>
  );
}

function TextareaDemo() {
  const [value, setValue] = createSignal("");
  return (
    <ShadowWrapper>
      <TextArea
        placeholder="Type a longer message..."
        value={value()}
        onInput={setValue}
        resize-y
        style={{ width: "100%", "min-height": "100px" }}
      />
    </ShadowWrapper>
  );
}

function SliderDemo() {
  const [value, setValue] = createSignal(5);
  return (
    <ShadowWrapper>
      <div style={{ width: "100%" }}>
        <Slider min={0} max={10} step={1} tick value={value()} onInput={setValue} />
      </div>
    </ShadowWrapper>
  );
}

function ModalDemo() {
  return (
    <ShadowWrapper>
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
    </ShadowWrapper>
  );
}

function ConfirmFooterDemo() {
  return (
    <ShadowWrapper>
      <div style={{ display: "flex", "flex-direction": "column", gap: "12px" }}>
        <Text weight={TextWeights.semibold}>Neutral:</Text>
        <ModalConfirmFooter close={() => {}} type="neutral" />
        <Text weight={TextWeights.semibold}>Danger:</Text>
        <ModalConfirmFooter close={() => {}} type="danger" />
        <Text weight={TextWeights.semibold}>Confirm:</Text>
        <ModalConfirmFooter close={() => {}} type="confirm" />
      </div>
    </ShadowWrapper>
  );
}

function LinkButtonDemo() {
  return (
    <ShadowWrapper>
      <LinkButton href="https://github.com/uwu/shelter">Visit shelter on GitHub</LinkButton>
    </ShadowWrapper>
  );
}

function ToastDemo() {
  return (
    <ShadowWrapper>
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
    </ShadowWrapper>
  );
}

function ScrollbarDemo() {
  return (
    <ShadowWrapper>
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
    </ShadowWrapper>
  );
}

function FocusringDemo() {
  return (
    <ShadowWrapper>
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
    </ShadowWrapper>
  );
}

function TooltipDemo() {
  return (
    <ShadowWrapper>
      <div style={{ display: "flex", gap: "8px", "justify-content": "center", "align-items": "center" }}>
        <button
          use:tooltip="Delete"
          style={{
            background: "var(--input-background-default)",
            border: "1px solid var(--input-border-default)",
            cursor: "pointer",
            padding: "8px 16px",
            "border-radius": "var(--radius-md)",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
          }}
        >
          <IconClose />
        </button>
        <button
          use:tooltip={[true, "Delete but underneath"]}
          style={{
            background: "var(--input-background-default)",
            border: "1px solid var(--input-border-default)",
            cursor: "pointer",
            padding: "8px 16px",
            "border-radius": "var(--radius-md)",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
          }}
        >
          <IconClose />
        </button>
        <Text>Try hovering the buttons!</Text>
      </div>
    </ShadowWrapper>
  );
}

const demos: Record<string, Component> = {
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

export type DemoName = keyof typeof demos;

export function getAvailableDemos(): string[] {
  return Object.keys(demos);
}

export function mountDemo(demoName: string, container: HTMLElement): () => void {
  const Demo = demos[demoName];
  if (!Demo) {
    container.textContent = `Unknown demo: ${demoName}`;
    return () => {};
  }

  const shadow = container.attachShadow({ mode: "open" });

  shadow.adoptedStyleSheets = [getStyleSheet()];

  if (document.head.dataset["demos"] !== "true") {
    injectInternalStyles();
    initToasts(document.body);

    document.head.dataset["demos"] = "true";
  }

  const dispose = render(() => <Demo />, shadow);

  return dispose;
}
