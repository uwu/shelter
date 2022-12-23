import { isInited, signalOf, solidMutWithSignal, storage, waitInit } from "./storage";
import { JSX } from "solid-js";
import { createMutable } from "solid-js/store";
import { log } from "./util";
import { ModalBody, ModalHeader, ModalRoot, openModal } from "shelter-ui";

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
  onUnload(): void;
  settings?(): JSX.Element;
};

const internalData = storage<StoredPlugin>("plugins-internal");
const pluginStorages = storage("plugins-data");
const [internalLoaded, loadedPlugins] = solidMutWithSignal(createMutable({} as Record<string, EvaledPlugin>));

export const installedPlugins = signalOf(internalData);
export { loadedPlugins };

function createStorage(pluginId: string): [Record<string, any>, () => void] {
  if (!isInited(pluginStorages))
    throw new Error("to keep data persistent, plugin storages must not be created until connected to IDB");

  const data = createMutable((pluginStorages[pluginId] ?? {}) as Record<string, any>);

  const flush = () => (pluginStorages[pluginId] = { ...data });

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

  if (internalLoaded[pluginId]) throw new Error("attempted to load an already loaded plugin");

  const [store, flushStore] = createStorage(pluginId);

  const shelterPluginEdition = {
    ...window["shelter"],
    plugin: {
      store,
      flushStore,
      manifest: data.manifest,
      showSettings: () =>
        openModal((mprops) => (
          <ModalRoot>
            <ModalHeader close={mprops.close}>Settings - {data.manifest.name}</ModalHeader>
            <ModalBody>{getSettings(pluginId)({})}</ModalBody>
          </ModalRoot>
        )),
    },
  };

  const pluginString = `shelter=>{return ${data.js}}${atob("Ci8v")}# sourceURL=s://!SHELTER/${pluginId}`;

  try {
    // noinspection CommaExpressionJS
    const rawPlugin: EvaledPlugin = (0, eval)(pluginString)(shelterPluginEdition);
    // clone this because the way some bundlers defineProperty does not play nice with the solid store
    const plugin = { ...rawPlugin };
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
    loadedData.onUnload();
  } catch (e) {
    log(`plugin ${pluginId} errored while unloading: ${e}`, "error");
  }

  delete internalLoaded[pluginId];
  internalData[pluginId] = { ...data, on: false };
}

async function updatePlugin(pluginId: string) {
  const data = internalData[pluginId];
  if (!data) throw new Error(`attempted to update a non-existent plugin: ${pluginId}`);
  if (internalLoaded[pluginId]) throw new Error(`attempted to update a loaded plugin: ${pluginId}`);

  if (data.update && data.src) {
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
  const results = await Promise.allSettled(allPlugins.map(updatePlugin));

  for (const res of results) if (res.status === "rejected") log(res.reason, "error");

  const toStart = allPlugins.filter((id) => internalData[id].on);

  // probably safer to do this in series though :p
  toStart.forEach(startPlugin);

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

export async function addRemotePlugin(id: string, src: string, update = true) {
  if (!id.endsWith("/")) id += "/";

  // validate
  if (typeof id !== "string" || id in internalData) throw new Error("plugin ID invalid or taken");

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
  delete internalData[id];
}

export const getSettings = (id: string) => internalLoaded[id]?.settings;
