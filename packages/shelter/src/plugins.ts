import { isInited, storage, waitInit } from "./storage";
import { JSX } from "solid-js";
import { createMutable } from "solid-js/store";
import { log } from "./util";

// a lot of this is adapted from cumcord, but some of it is new, and hopefully the code should be a lot less messy :)

type StoredPlugin = {
  on: boolean;
  js: string;
  update: boolean;
  src?: string;
  manifest: Record<string, string>;
};

type EvaledPlugin = {
  onLoad?(): void;
  onUnload(): void;
  settings?(): JSX.Element;
};

const internalData = storage<StoredPlugin>("plugins-internal");
const pluginData = storage("plugins-data");
const loadedPlugins = createMutable({} as Record<string, EvaledPlugin>);

function createStorage(pluginId: string): [Record<string, any>, () => void] {
  if (!isInited(pluginData))
    throw new Error("to keep data persistent, plugin storages must not be created until connected to IDB");

  const data = createMutable((pluginData[pluginId] ?? {}) as Record<string, any>);

  const flush = () => (pluginData[pluginId] = { ...data });

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

export function startPlugin(pluginId: string) {
  const data = internalData[pluginId];
  if (!data) throw new Error(`attempted to load a non-existent plugin: ${pluginId}`);

  if (loadedPlugins[pluginId]) throw new Error("attempted to load an already loaded plugin");

  const [store, flushStore] = createStorage(pluginId);

  const shelterPluginEdition = { ...window["shelter"] }; // TODO figure out if avoiding window actually matters
  shelterPluginEdition.plugin = {
    store,
    flushStore,
    manifest: data.manifest,
    showSettings() {
      throw new Error("not implemented"); //TODO
    },
  };

  const pluginString = `shelter=>{return ${data.js}}${atob("Ci8v")}# sourceURL=shelter/${pluginId}`;

  try {
    // noinspection CommaExpressionJS
    const plugin: EvaledPlugin = (0, eval)(pluginString)(shelterPluginEdition);
    loadedPlugins[pluginId] = plugin;

    plugin.onLoad?.();

    internalData[pluginId] = { ...data, on: true };
  } catch (e) {
    log(`plugin ${pluginId} errored while loading and will be unloaded: ${e}`, "error");

    try {
      loadedPlugins[pluginId]?.onUnload?.();
    } catch (e2) {
      log(`plugin ${pluginId} errored while unloading: ${e2}`, "error");
    }

    delete loadedPlugins[pluginId];
    internalData[pluginId] = { ...data, on: false };
  }
}

export function stopPlugin(pluginId: string) {
  const data = internalData[pluginId];
  const loadedData = loadedPlugins[pluginId];
  if (!data) throw new Error(`attempted to unload a non-existent plugin: ${pluginId}`);
  if (!loadedData) throw new Error(`attempted to unload a non-loaded plugin: ${pluginId}`);

  try {
    loadedData.onUnload();
  } catch (e) {
    log(`plugin ${pluginId} errored while unloading: ${e}`, "error");
  }

  delete loadedPlugins[pluginId];
  internalData[pluginId] = { ...data, on: false };
}

async function updatePlugin(pluginId: string) {
  const data = internalData[pluginId];
  if (!data) throw new Error(`attempted to update a non-existent plugin: ${pluginId}`);
  if (loadedPlugins[pluginId]) throw new Error(`attempted to update a loaded plugin: ${pluginId}`);

  if (data.update && data.src) {
    try {
      const newPluginManifest = await (await fetch(new URL("plugin.json", data.src))).json();

      if (data.manifest.hash !== undefined && newPluginManifest.hash === data.manifest.hash) return false;

      const newPluginText = await (await fetch(new URL("plugin.js", data.src))).text();

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
  await Promise.all([waitInit(internalData), waitInit(pluginData)]);

  // update in parallel
  await Promise.all(Object.keys(internalData).map(updatePlugin));

  // probably safer to do this in series though :p
  Object.keys(internalData).forEach(startPlugin);

  // makes things cleaner in index.ts init
  return stopAllPlugins;
}

export function addLocalPlugin(id: string, plugin: StoredPlugin) {
  // validate
  if (typeof id !== "string" || id in internalData) throw new Error("plugin ID invalid or taken");

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

export async function addRemotePlugin(id: string, src: string) {
  // validate
  if (typeof id !== "string" || id in internalData) throw new Error("plugin ID invalid or taken");

  internalData[id] = {
    src,
    update: true,
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
  if (id in loadedPlugins) stopPlugin(id);
  delete internalData[id];
}
