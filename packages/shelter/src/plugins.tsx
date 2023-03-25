import { isInited, signalOf, solidMutWithSignal, idbStore, waitInit } from "./storage";
import { Component, createSignal, JSX } from "solid-js";
import { createMutable } from "solid-js/store";
import { createScopedApi, log } from "./util";
import { ModalBody, ModalHeader, ModalRoot, openModal } from "@uwu/shelter-ui";
import { devModeReservedId } from "./devmode";

// a lot of this is adapted from cumcord, but some of it is new, and hopefully the code should be a lot less messy :)

export type StoredPlugin = {
  on: boolean;
  js: string;
  update: boolean;
  src?: string;
  manifest: Record<string, string>;
};

export type EvaledPlugin = {
  onLoad?(): void;
  onUnload?(): void;
  settings?: Component;
  // technically not on an evaled plugin but we add it to the plugin literally as soon as we eval it
  scopedDispose(): void;
};

const internalData = idbStore<StoredPlugin>("plugins-internal");
const pluginStorages = idbStore("plugins-data");
const [internalLoaded, loadedPlugins] = solidMutWithSignal(createMutable({} as Record<string, EvaledPlugin>));

export const installedPlugins = signalOf(internalData);
export { loadedPlugins };

function createStorage(pluginId: string): [Record<string, any>, () => void] {
  if (!isInited(pluginStorages))
    throw new Error("to keep data persistent, plugin storages must not be created until connected to IDB");

  const data = createMutable((pluginStorages[pluginId] ?? {}) as Record<string, any>);

  const flush = () => {
    pluginStorages[pluginId] = { ...data };
  };

  return [
    new Proxy(data, {
      set(t, p, v, r) {
        queueMicrotask(flush);
        return Reflect.set(t, p, v, r);
      },
      deleteProperty(t, p) {
        queueMicrotask(flush);
        return Reflect.deleteProperty(t, p);
      },
    }),
    flush,
  ];
}

function createPluginApi(pluginId: string, { manifest }: StoredPlugin) {
  const [store, flushStore] = createStorage(pluginId);
  const scoped = createScopedApi(window["shelter"].flux.dispatcher); // this feels not nice but i guess its ok?

  return {
    store,
    flushStore,
    manifest,
    showSettings: () =>
      openModal((mprops) => (
        <ModalRoot>
          <ModalHeader close={mprops.close}>Settings - {manifest.name}</ModalHeader>
          <ModalBody>{getSettings(pluginId)({})}</ModalBody>
        </ModalRoot>
      )),
    scoped,
  };
}

export type ShelterPluginApi = ReturnType<typeof createPluginApi>;

export function startPlugin(pluginId: string) {
  const data = internalData[pluginId];
  if (!data) throw new Error(`attempted to load a non-existent plugin: ${pluginId}`);

  if (internalLoaded[pluginId]) throw new Error("attempted to load an already loaded plugin");

  const pluginApi = createPluginApi(pluginId, data);

  const shelterPluginEdition = {
    ...window["shelter"],
    plugin: pluginApi,
  };

  const pluginString = `shelter=>{return ${data.js}}${atob("Ci8v")}# sourceURL=s://!SHELTER/${pluginId}`;

  try {
    // noinspection CommaExpressionJS
    const rawPlugin: EvaledPlugin = (0, eval)(pluginString)(shelterPluginEdition);
    // clone this because the way some bundlers defineProperty does not play nice with the solid store
    const plugin = { ...rawPlugin, scopedDispose: pluginApi.scoped.disposeAllNow };
    internalLoaded[pluginId] = plugin;

    plugin.onLoad?.();

    internalData[pluginId] = { ...data, on: true };
  } catch (e) {
    log(`plugin ${pluginId} errored while loading and will be unloaded: ${e}`, "error");

    try {
      internalLoaded[pluginId]?.onUnload?.();
    } catch (e2) {
      log(`plugin ${pluginId} errored while unloading: ${e2}`, "error");
    }

    delete internalLoaded[pluginId];
    internalData[pluginId] = { ...data, on: false };
  }
}

export function stopPlugin(pluginId: string) {
  const data = internalData[pluginId];
  const loadedData = internalLoaded[pluginId];
  if (!data) throw new Error(`attempted to unload a non-existent plugin: ${pluginId}`);
  if (!loadedData) throw new Error(`attempted to unload a non-loaded plugin: ${pluginId}`);

  try {
    loadedData.onUnload?.();
  } catch (e) {
    log(`plugin ${pluginId} errored while unloading: ${e}`, "error");
  }
  try {
    loadedData.scopedDispose();
  } catch (e) {
    log(`plugin ${pluginId} errored while unloading scoped APIs: ${e}`, "error");
  }

  delete internalLoaded[pluginId];
  internalData[pluginId] = { ...data, on: false };
}

async function updatePlugin(pluginId: string) {
  const data = internalData[pluginId];
  if (!data) throw new Error(`attempted to update a non-existent plugin: ${pluginId}`);
  if (internalLoaded[pluginId]) throw new Error(`attempted to update a loaded plugin: ${pluginId}`);

  if (data.src) {
    try {
      const newPluginManifest = await (await fetch(new URL("plugin.json", data.src), { cache: "no-store" })).json();

      if (data.manifest.hash !== undefined && newPluginManifest.hash === data.manifest.hash) return false;

      const newPluginText = await (await fetch(new URL("plugin.js", data.src), { cache: "no-store" })).text();

      internalData[pluginId] = {
        ...data,
        js: newPluginText,
        manifest: newPluginManifest,
      };

      return true;
    } catch (e) {
      throw new Error(`failed to update plugin ${pluginId}: ${e}`);
    }
  }

  return false;
}

const stopAllPlugins = () => Object.keys(internalData).forEach(stopPlugin);

export async function startAllPlugins() {
  // allow plugin stores to connect to IDB, as we need to read persisted data from them straight away
  await Promise.all([waitInit(internalData), waitInit(pluginStorages)]);

  const allPlugins = Object.keys(internalData);

  // update in parallel
  const results = await Promise.allSettled(allPlugins.filter((id) => internalData[id].update).map(updatePlugin));

  for (const res of results) if (res.status === "rejected") log(res.reason, "error");

  const toStart = allPlugins.filter((id) => internalData[id].on && id !== devModeReservedId);

  // probably safer to do this in series though :p
  toStart.forEach(startPlugin);

  // makes things cleaner in index.ts init
  return stopAllPlugins;
}

export function addLocalPlugin(id: string, plugin: StoredPlugin) {
  // validate
  if (typeof id !== "string" || id in internalData || id === devModeReservedId)
    throw new Error("plugin ID invalid or taken");

  if (
    typeof plugin.js !== "string" ||
    typeof plugin.update !== "boolean" ||
    (plugin.src !== undefined && typeof plugin.src !== "string") ||
    typeof plugin.manifest !== "object"
  )
    throw new Error("Plugin object failed validation");

  plugin.on = false;

  internalData[id] = plugin;
}

export async function addRemotePlugin(id: string, src: string, update = true) {
  if (!src.endsWith("/")) src += "/";

  // validate
  if (typeof id !== "string" || id in internalData || id === devModeReservedId)
    throw new Error("plugin ID invalid or taken");

  internalData[id] = {
    src,
    update,
    on: false,
    manifest: {},
    js: "",
  };

  try {
    if (!(await updatePlugin(id))) delete internalData[id];
  } catch (e) {
    delete internalData[id];
    throw e;
  }
}

export function removePlugin(id: string) {
  if (!internalData[id]) throw new Error(`attempted to remove non-existent plugin ${id}`);
  if (id in internalLoaded) stopPlugin(id);
  if (id === devModeReservedId) delete pluginStorages[id];
  delete internalData[id];
}

export const getSettings = (id: string) => internalLoaded[id]?.settings;

// maybe this should be elsewhere but w/e
export const devmodePrivateApis = {
  initDevmodePlugin: () =>
    (internalData[devModeReservedId] = {
      update: false,
      on: false,
      manifest: {},
      js: "{onUnload(){}}",
    }),
  replacePlugin: (obj: { js: string; manifest: object }) => Object.assign(internalData[devModeReservedId], obj),
};
