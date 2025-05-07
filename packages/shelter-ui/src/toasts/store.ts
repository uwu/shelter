import { type Component, createSignal } from "solid-js";

interface ToastComponent {
  id: string;
  component: Component;
}

const [sig, setSig] = createSignal<ToastComponent[]>([]);

export const toasts = () => Object.freeze(sig());
export const setToasts = (t: ToastComponent[]) => setSig(t);

export const removeToast = (id: string) => {
  const newToasts = toasts().filter((toast) => toast.id !== id);
  setToasts(newToasts);
};
