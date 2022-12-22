import { Component, createSignal } from "solid-js";

const [sig, setSig] = createSignal<Component[]>([]);

export const toasts = () => Object.freeze(sig());
export const setToasts = (t: Component[]) => setSig(t);
