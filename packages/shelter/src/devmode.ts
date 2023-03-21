import { devmodePrivateApis, installedPlugins, loadedPlugins, removePlugin, startPlugin, stopPlugin } from "./plugins";
import { observe } from "./observer";
import { injectCss } from "shelter-ui";

// any string would work here but this is funnier
export const devModeReservedId = "__DEVMODE_PLUGIN_DO_NOT_USE_OR_YOU_WILL_BE_FIRED";

const websocketUrl = "ws://127.0.0.1:1211"; // 2022-11-12
const pluginUrl = "http://127.0.0.1:1112"; // also 22-11-12 lol

let websocket: WebSocket;

const devModeIsOn = () => installedPlugins() && devModeReservedId in installedPlugins();

let isDevButtonHovered = false;

const css = `
.shelter-devIcon > div > svg > path {
  d: path("m15.5 3.9c-.2-.2-.6-.2-.9 0l-.8.8c-.2.2-.2.6 0 .8l6 6.1c.2.2.2.6 0 .8l-6 6.1c-.2.2-.2.6 0 .8l.8.8c.2.2.6.2.9 0l7.6-7.7c.2-.2.2-.6 0-.8l-7.6-7.7zm-5.4 1.6c.2-.2.2-.6 0-.8l-.8-.8c-.2-.2-.6-.2-.9 0l-7.6 7.7c-.2.2-.2.6 0 .8l7.6 7.7c.2.2.6.2.9 0l.8-.8c.2-.2.2-.6 0-.8l-6-6.1c-.2-.2-.2-.6 0-.8l6-6.1z")
}
`;

// called on shelter reload, last.
export async function initDevmode() {
  // TODO
  injectCss(css);

  observe(`[class*="anchor-"]`, (e: HTMLAnchorElement) => {
    if (devModeIsOn && e.href === "https://support.discord.com/") {
      e.href = "#";
      e.target = "";
      // TODO: Open modal with dev component
      e.onclick = () => console.log("placeholder!");
      e.classList.add("shelter-devIcon");
      e.onmouseenter = () => (isDevButtonHovered = true);
      e.onmouseleave = () => (isDevButtonHovered = false);
    }
  });

  observe(`[class*="layerContainer-"] > div > [class*="tooltip-"] > [class*="tooltipContent-"]`, (e: HTMLElement) => {
    if (devModeIsOn() && isDevButtonHovered && e.innerText !== "Dev") {
      e.innerText = "Dev";
    }
  });
}

function stopDevmode() {
  removePlugin(devModeReservedId);
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

  startPlugin(devModeReservedId);
}

// expects the dev mode plugin to already exist, but dev mode to not be inited.
function enableDevmodeUnchecked() {
  websocket = new WebSocket(websocketUrl);

  websocket.onclose = stopDevmode;

  websocket.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);

    if (msg.TYPE === "update") refetchDevPlugin();
  };
}

export function enableDevmode() {
  if (devModeIsOn()) return;

  // adds a stub devmode plugin
  devmodePrivateApis.initDevmodePlugin();

  enableDevmodeUnchecked();
}
