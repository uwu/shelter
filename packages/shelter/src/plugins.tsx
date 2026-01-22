import { storage, unbacked, flush as flushShelterStorage, signalOf } from "./storage";
import { Component, onCleanup } from "solid-js";
import { createScopedApiInternal, log, prettifyError } from "./util";
import {
  ModalBody,
  ModalHeader,
  ModalRoot,
  ModalFooter,
  Button,
  ButtonColors,
  ButtonSizes,
  openModal,
} from "@uwu/shelter-ui";
import { devModeReservedId } from "./devmode";
import { registerInjSection, setInjectorSections } from "./settings";

// note that these controls only apply to the UI, not to the APIs
export type LoaderIntegrationOpts = {
  // actions that the end user is shown on the UI
  allowedActions: { toggle?: true; delete?: true; edit?: true; update?: true };
  // is the plugin visible in the ui, or hidden from sight?
  isVisible: boolean;
  // a name to show in the info tooltip for the loader
  loaderName?: string;
};

export type StoredPlugin = {
  on: boolean;
  js: string;
  update: boolean;
  src?: string;
  // optional for backwards compat, but should be filled in always from 2024-09-20
  // the plugin loader will automatically set this if not present to (!src)
  local: boolean;
  manifest: Record<string, string>;
  // non existent for normal plugins
  injectorIntegration?: LoaderIntegrationOpts;
};

export type EvaledPlugin = {
  onLoad?(): void;
  onUnload?(): void;
  settings?: Component;
  // technically not on an evaled plugin but we add it to the plugin literally as soon as we eval it
  scopedDispose(): void;
};

let internalData: Record<string, StoredPlugin>;
const internalDataInited = storage("plugins-internal").then((store) => {
  internalData = store;
});

let pluginStorages: Record<string, any>;
const pluginStoragesInited = storage("plugins-data").then((store) => {
  pluginStorages = store;
});

const internalLoaded = unbacked() as Record<string, EvaledPlugin>;
const loadedPlugins = signalOf(internalLoaded);

// dear god do not let these go anywhere other than data.ts
export { internalData as UNSAFE_internalData, pluginStorages as UNSAFE_pluginStorages };

export const installedPlugins = signalOf(internalData);
export { loadedPlugins };

function createStorage(pluginId: string): [Record<string, any>, () => void] {
  if (!pluginStorages)
    throw new Error("to keep data persistent, plugin storages must not be created until connected to IDB");

  const data = (pluginStorages[pluginId] ??= {});

  return [data, () => flushShelterStorage(data)];
}

function createPluginApi(pluginId: string, { manifest, injectorIntegration }: StoredPlugin) {
  const [store, flushStore] = createStorage(pluginId);
  const scoped = createScopedApiInternal(window["shelter"].flux.dispatcher, !!injectorIntegration);

  return {
    store,
    flushStore,
    id: pluginId,
    manifest,
    showSettings: () =>
      openModal((mprops) => (
        <ModalRoot>
          <ModalHeader close={mprops.close}>Settings - {manifest.name}</ModalHeader>
          <ModalBody>{getSettings(pluginId)({})}</ModalBody>
          <ModalFooter>
            <Button
              size={ButtonSizes.MEDIUM}
              color={ButtonColors.PRIMARY}
              onclick={() => {
                mprops.close();
              }}
            >
              Done
            </Button>
          </ModalFooter>
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

  // injector plugins have superpowers
  if (data.injectorIntegration)
    shelterPluginEdition.settings = {
      ...shelterPluginEdition.settings,
      setInjectorSections,
      registerSection: registerInjSection,
    } as any; // otherwise, cannot add setInjectorSections, lol

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
    log([`plugin ${pluginId} errored while loading and will be unloaded`, e], "error");

    try {
      internalLoaded[pluginId]?.onUnload?.();
    } catch (e2) {
      log([`plugin ${pluginId} errored while unloading`, e2], "error");
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
    log([`plugin ${pluginId} errored while unloading`, e], "error");
  }
  try {
    loadedData.scopedDispose();
  } catch (e) {
    log([`plugin ${pluginId} errored while unloading scoped APIs`, e], "error");
  }

  delete internalLoaded[pluginId];
  internalData[pluginId] = { ...data, on: false };
}

async function fetchUpdate(pluginId: string): Promise<false | StoredPlugin> {
  const data = internalData[pluginId];
  if (!data) throw new Error(`attempted to update a non-existent plugin: ${pluginId}`);
  if (data.local) throw new Error("cannot check for updates to a local plugin.");
  if (!data.src) throw new Error("cannot check for updates to a plugin with no src");

  try {
    const newPluginManifest = await (await fetch(new URL("plugin.json", data.src), { cache: "no-store" })).json();

    if (data.manifest.hash !== undefined && newPluginManifest.hash === data.manifest.hash) return false;

    const newPluginText = await (await fetch(new URL("plugin.js", data.src), { cache: "no-store" })).text();

    return {
      ...data,
      js: newPluginText,
      manifest: newPluginManifest,
    };
  } catch (e) {
    throw new Error(`failed to check for updates for ${pluginId}\n${prettifyError(e)}`, { cause: e });
  }
}

export async function updatePlugin(pluginId: string) {
  const checked = await fetchUpdate(pluginId);

  if (checked) {
    editPlugin(pluginId, checked, true);
    return true;
  } else {
    return false;
  }
}

const stopAllPlugins = () => Object.keys(internalData).forEach(stopPlugin);

export async function startAllPlugins() {
  // allow plugin stores to connect to IDB, as we need to read persisted data from them straight away
  await Promise.all([internalDataInited, pluginStoragesInited]);

  const allPlugins = Object.keys(internalData);

  // migrate missing local keys from before it was stored
  for (const k of allPlugins) if (internalData[k].local === undefined) internalData[k].local = !internalData[k].src;

  // update in parallel
  const results = await Promise.allSettled(
    allPlugins.filter((id) => internalData[id].update && !internalData[id].local).map(updatePlugin),
  );

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

  if (!plugin.local) plugin.local = true;
  delete plugin.injectorIntegration;

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
    local: false,
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

export function editPlugin(id: string, overwrite: StoredPlugin, updating = false) {
  if (!internalData[id])
    throw new Error(`attempted to ${updating ? "apply update to" : "edit"} non-existent plugin ${id}`);
  const wasRunning = id in internalLoaded;
  if (wasRunning) stopPlugin(id);
  // modify plugin
  internalData[id] = overwrite;
  // potentially restart plugin
  if (wasRunning) startPlugin(id);
}

export function showSettingsFor(id: string) {
  const p = internalLoaded[id];
  if (!p) throw new Error(`cannot show plugins for non-loaded plugin ${id}`);
  if (!p.settings) throw new Error(`cannot show plugins for ${id}, which has no settings`);

  return new Promise<void>((res) => {
    openModal((mprops) => {
      onCleanup(res);
      return (
        <ModalRoot>
          <ModalHeader close={mprops.close}>Settings - {internalData[id].manifest.name}</ModalHeader>
          <ModalBody>{p.settings({})}</ModalBody>
        </ModalRoot>
      );
    });
  });
}

// this is used by shelter to install plugins with loader superpowers
export async function ensureLoaderPlugin(id: string, plugin: [string, LoaderIntegrationOpts] | StoredPlugin) {
  // allow internalData to connect to IDB, as we need to read plugin-internals
  await Promise.all([internalDataInited, pluginStoragesInited]);

  const isRemote = Array.isArray(plugin);
  const integration = isRemote ? plugin?.[1] : plugin?.injectorIntegration;

  if (typeof integration?.isVisible !== "boolean")
    throw new Error("cannot add a loader plugin without an isVisible setting");

  if (typeof integration?.allowedActions !== "object" || integration.allowedActions == null)
    throw new Error("cannot add a loader plugin without an allowed actions object");

  if (!isRemote) {
    plugin.local = true;
    plugin.update = false;
    delete plugin.src;
    delete plugin.on;
  }

  if (id in internalData) {
    // existing plugins need to be off so we can set their stuff up
    if (id in internalLoaded) throw new Error("ensureLoaderPlugin must not be called with running plugin IDs!");

    if (isRemote) {
      internalData[id].src = plugin[0];
      internalData[id].update = true;
      internalData[id].local = false;
    } else {
      Object.assign(internalData[id], plugin);
      delete internalData[id].src;
    }

    // if a plugin is un-toggleable or invisible, ensure its always on. if its toggleable and exists, leave it alone.
    if (!integration.allowedActions.toggle || !integration.isVisible) internalData[id].on = true;
  }
  // install plugin
  else {
    if (isRemote) await addRemotePlugin(id, plugin[0], true);
    else addLocalPlugin(id, plugin);

    // unlike most shelter plugins, NEW loader plugins default to on
    internalData[id].on = true;
  }

  // set integration
  // replace object to force db write
  internalData[id] = {
    ...internalData[id],
    injectorIntegration: integration,
  };
}

// maybe this should be elsewhere but w/e
export const devmodePrivateApis = {
  initDevmodePlugin: () =>
    (internalData[devModeReservedId] = {
      local: true,
      update: false,
      on: false,
      manifest: {},
      js: "{onUnload(){}}",
    }),
  replacePlugin: (obj: { js: string; manifest: object }) => Object.assign(internalData[devModeReservedId], obj),
};
