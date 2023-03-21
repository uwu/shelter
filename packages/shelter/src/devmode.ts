import { devmodePrivateApis, installedPlugins, loadedPlugins, removePlugin, startPlugin, stopPlugin } from "./plugins";

// any string would work here but this is funnier
export const devModeReservedId = "__DEVMODE_PLUGIN_DO_NOT_USE_OR_YOU_WILL_BE_FIRED";

const websocketUrl = "ws://127.0.0.1:1211"; // 2022-11-12
const pluginUrl = "http://127.0.0.1:1112"; // also 22-11-12 lol

let websocket: WebSocket;

const devModeIsOn = () => installedPlugins() && devModeReservedId in installedPlugins();

// called on shelter reload, last.
export async function initDevmode() {
  // TODO
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
