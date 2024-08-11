import { createEffect, createSignal, untrack } from "solid-js";
import { injectCss } from "./util";

const styleSet = new Set<string>();

const [styleTxt, setStyleTxt] = createSignal("");

export const ensureInternalStyle = (style: string) => {
  if (styleSet.has(style)) {
    return;
  }
  styleSet.add(style);
  setStyleTxt((v) => v + style);
};

export const InternalStyles = () => <style>{styleTxt()}</style>;

export function injectInternalStyles() {
  const mod = injectCss(" ");
  createEffect(() => mod(styleTxt()));
}
