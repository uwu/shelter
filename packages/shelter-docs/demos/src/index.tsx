import type { Component } from "solid-js";
import { render } from "solid-js/web";
import compatCss from "virtual:compat-css";
import { InternalStyles, initToasts, injectInternalStyles } from "@uwu/shelter-ui";

import ButtonColorsDemo from "./demos/ButtonColorsDemo";
import ButtonSizesDemo from "./demos/ButtonSizesDemo";
import HeadersDemo from "./demos/HeadersDemo";
import TextVariantsDemo from "./demos/TextVariantsDemo";
import TextWeightsDemo from "./demos/TextWeightsDemo";
import DividerDemo from "./demos/DividerDemo";
import SwitchDemo from "./demos/SwitchDemo";
import SwitchItemDemo from "./demos/SwitchItemDemo";
import CheckboxDemo from "./demos/CheckboxDemo";
import CheckboxItemDemo from "./demos/CheckboxItemDemo";
import TextboxDemo from "./demos/TextboxDemo";
import TextareaDemo from "./demos/TextareaDemo";
import SliderDemo from "./demos/SliderDemo";
import ConfirmFooterDemo from "./demos/ConfirmFooterDemo";
import LinkButtonDemo from "./demos/LinkButtonDemo";
import ToastDemo from "./demos/ToastDemo";
import ScrollbarDemo from "./demos/ScrollbarDemo";
import FocusringDemo from "./demos/FocusringDemo";
import TooltipDemo from "./demos/TooltipDemo";
import GenIdDemo from "./demos/GenIdDemo";
import OpenModalDemo from "./demos/OpenModalDemo";
import ConfirmationModalDemo from "./demos/ConfirmationModalDemo";
import ErrorBoundaryDemo from "./demos/ErrorBoundaryDemo";

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

const demos: Record<string, Component> = {
  "button-colors": () => (
    <ShadowWrapper>
      <ButtonColorsDemo />
    </ShadowWrapper>
  ),
  "button-sizes": () => (
    <ShadowWrapper>
      <ButtonSizesDemo />
    </ShadowWrapper>
  ),
  headers: () => (
    <ShadowWrapper>
      <HeadersDemo />
    </ShadowWrapper>
  ),
  "text-variants": () => (
    <ShadowWrapper>
      <TextVariantsDemo />
    </ShadowWrapper>
  ),
  "text-weights": () => (
    <ShadowWrapper>
      <TextWeightsDemo />
    </ShadowWrapper>
  ),
  divider: () => (
    <ShadowWrapper>
      <DividerDemo />
    </ShadowWrapper>
  ),
  switch: () => (
    <ShadowWrapper>
      <SwitchDemo />
    </ShadowWrapper>
  ),
  "switch-item": () => (
    <ShadowWrapper>
      <SwitchItemDemo />
    </ShadowWrapper>
  ),
  checkbox: () => (
    <ShadowWrapper>
      <CheckboxDemo />
    </ShadowWrapper>
  ),
  "checkbox-item": () => (
    <ShadowWrapper>
      <CheckboxItemDemo />
    </ShadowWrapper>
  ),
  textbox: () => (
    <ShadowWrapper>
      <TextboxDemo />
    </ShadowWrapper>
  ),
  textarea: () => (
    <ShadowWrapper>
      <TextareaDemo />
    </ShadowWrapper>
  ),
  slider: () => (
    <ShadowWrapper>
      <SliderDemo />
    </ShadowWrapper>
  ),
  "confirm-footer": () => (
    <ShadowWrapper>
      <ConfirmFooterDemo />
    </ShadowWrapper>
  ),
  "link-button": () => (
    <ShadowWrapper>
      <LinkButtonDemo />
    </ShadowWrapper>
  ),
  toast: () => (
    <ShadowWrapper>
      <ToastDemo />
    </ShadowWrapper>
  ),
  scrollbar: () => (
    <ShadowWrapper>
      <ScrollbarDemo />
    </ShadowWrapper>
  ),
  focusring: () => (
    <ShadowWrapper>
      <FocusringDemo />
    </ShadowWrapper>
  ),
  tooltip: () => (
    <ShadowWrapper>
      <TooltipDemo />
    </ShadowWrapper>
  ),
  "gen-id": () => (
    <ShadowWrapper>
      <GenIdDemo />
    </ShadowWrapper>
  ),
  "open-modal": () => (
    <ShadowWrapper>
      <OpenModalDemo />
    </ShadowWrapper>
  ),
  "confirmation-modal": () => (
    <ShadowWrapper>
      <ConfirmationModalDemo />
    </ShadowWrapper>
  ),
  "error-boundary": () => (
    <ShadowWrapper>
      <ErrorBoundaryDemo />
    </ShadowWrapper>
  ),
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
