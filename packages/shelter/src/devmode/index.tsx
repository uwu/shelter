import { devmodePrivateApis, installedPlugins, loadedPlugins, removePlugin, startPlugin, stopPlugin } from "../plugins";
import { observe } from "../observer";
import { injectCss, ModalBody, ModalHeader, ModalRoot, ModalSizes, openModal } from "shelter-ui";
import { css, classes } from "./devmode.css";
import { log } from "../util";
import DevUI from "../components/DevUI";
import { createEffect } from "solid-js";

// any string would work here but this is funnier
export const devModeReservedId = "__DEVMODE_PLUGIN_DO_NOT_USE_OR_YOU_WILL_BE_FIRED";

const websocketUrl = "ws://127.0.0.1:1211"; // 2022-11-12
const pluginUrl = "http://127.0.0.1:1112"; // also 22-11-12 lol

let websocket: WebSocket;

const devModeIsOn = () => installedPlugins() && devModeReservedId in installedPlugins();

let removeDevmodeModal: () => void;
function openDevmodeModal() {
  removeDevmodeModal?.();

  removeDevmodeModal = openModal((props) => (
    <ModalRoot size={ModalSizes.MEDIUM}>
      <ModalHeader close={props.close}>Developer Tools</ModalHeader>
      <ModalBody>
        <DevUI />
      </ModalBody>
    </ModalRoot>
  ));
}

// called on shelter reload
export async function initDevmode() {
  const unstyle = injectCss(css);

  let isDevButtonHovered = false;

  let unobs1: () => void, unobs2: () => void;

  createEffect(() => {
    unobs1?.();
    unobs2?.();

    if (devModeIsOn()) {
      unobs1 = observe(`[class*="anchor"]`, (e: HTMLAnchorElement) => {
        if (e.href === "https://support.discord.com/") {
          e.href = "#";
          e.target = "";
          e.onclick = openDevmodeModal;
          e.classList.add(classes.devicon);
          e.onmouseenter = () => (isDevButtonHovered = true);
          e.onmouseleave = () => (isDevButtonHovered = false);
        }
      });

      unobs2 = observe(
        `[class*="layerContainer"] > div > [class*="tooltip"] > [class*="tooltipContent"]`,
        (e: HTMLElement) => {
          if (isDevButtonHovered && e.innerText !== "Dev") {
            e.innerText = "Dev";
          }
        },
      );
    }
  });

  if (devModeIsOn())
    await enableDevmodeUnchecked().catch((err) => {
      log(["devmode not reopened since last time", err], "warn");
      stopDevmode();
    });

  return () => {
    unstyle();
    unobs1?.();
    unobs2?.();
  };
}

// do i need to mutex this? yes!
// do i want to? no.
async function refetchDevPlugin() {
  const fetched = await (await fetch(pluginUrl)).json();
  if (typeof fetched.js !== "string" || typeof fetched.manifest !== "object")
    throw new Error("object received from lune was not valid");

  if (loadedPlugins()[devModeReservedId]) stopPlugin(devModeReservedId);

  // its probably safer to give the plugin a tick or so to sort itself out
  await new Promise((res) => setTimeout(res));

  devmodePrivateApis.replacePlugin(fetched);

  log("Reloading dev mode plugin");

  startPlugin(devModeReservedId);
}

// expects the dev mode plugin to already exist, but dev mode to not be inited.
const enableDevmodeUnchecked = () =>
  new Promise((res, rej) => {
    websocket = new WebSocket(websocketUrl);

    websocket.onclose = stopDevmode;

    websocket.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);

      if (msg.TYPE === "update") refetchDevPlugin();
    };

    websocket.onopen = res;
    websocket.onerror = rej;
  });

export function enableDevmode() {
  if (devModeIsOn()) return;

  // adds a stub devmode plugin
  devmodePrivateApis.initDevmodePlugin();

  return enableDevmodeUnchecked();
}

export function stopDevmode() {
  if (!devModeIsOn()) return;
  removePlugin(devModeReservedId);

  websocket.close();
  websocket = undefined;
}
