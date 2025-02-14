import { dbStore } from "./storage";
import {
  installedPlugins,
  loadedPlugins,
  removePlugin,
  startPlugin,
  stopPlugin,
  StoredPlugin,
  UNSAFE_internalData as internalData,
  UNSAFE_pluginStorages as pluginStorages,
} from "./plugins";

// unusually, there is no `shelter.data` as otherwise freely reading and writing shelter's storages without user consent would be possible, which isn't great.

export type ExportedLocalPlugin = Pick<StoredPlugin, "on" | "js" | "manifest">;
export type ExportedRemotePlugin = Pick<StoredPlugin, "on" | "js" | "manifest" | "update">;
export type DataExport = {
  // dbstore content (misc shelter configuration)
  dbStore: Record<string, any>;
  // local plugins of form { id: [ plugin obj, plugin data? ] }
  // remote plugins of the form { src: [ plugin obj, plugin data? ] }
  localPlugins: Record<string, [ExportedLocalPlugin] | [ExportedLocalPlugin, object]>;
  remotePlugins: Record<string, [ExportedRemotePlugin] | [ExportedRemotePlugin, object]>;
};

// pluginsToExport is of the form { id: should export data too }
export function exportData(pluginsToExport: Record<string, boolean>) {
  const exp: DataExport = {
    dbStore: { ...dbStore },
    localPlugins: {},
    remotePlugins: {},
  };

  for (const id in internalData) {
    if (!(id in pluginsToExport)) continue;

    const plugin = internalData[id];

    if ("injectorIntegration" in plugin) continue;

    const pluginData = pluginsToExport[id] ? { ...pluginStorages[id] } : undefined;

    if (plugin.local) {
      exp.localPlugins[id] = [
        {
          on: plugin.on,
          js: plugin.js,
          manifest: plugin.manifest,
        },
      ];
      if (pluginData) exp.localPlugins[id].push(pluginData);
    } else {
      exp.remotePlugins[plugin.src] = [
        {
          update: plugin.update,
          on: plugin.on,
          js: plugin.js,
          manifest: plugin.manifest,
        },
      ];
      if (pluginData) exp.remotePlugins[plugin.src].push(pluginData);
    }
  }

  return exp;
}

export function importData(dataToImport: DataExport) {
  Object.assign(dbStore, dataToImport.dbStore);

  // for each local plugin, if its unique, import it
  // if the id exists, stop it, overwrite data if present, merge the objects, and if relevant, start it.
  for (const localId in dataToImport.localPlugins) {
    const newLocal = dataToImport.localPlugins[localId];

    if (localId in loadedPlugins()) stopPlugin(localId);

    if (newLocal.length > 1) pluginStorages[localId] = newLocal[1];

    internalData[localId] = {
      ...(internalData[localId] || { update: false }),
      local: true,
      on: false,
      js: newLocal[0].js ?? "",
      manifest: newLocal[0].manifest ?? {},
    };

    if (newLocal[0].on) startPlugin(localId);
  }

  // now do remote plugins
  for (const remoteSrc in dataToImport.remotePlugins) {
    const newRemote = dataToImport.remotePlugins[remoteSrc];

    // find the plugin id of the one to merge with, and remove copies of plugins with the same src
    let idToApplyTo: string;

    for (const id in installedPlugins())
      if (internalData[id].src === remoteSrc) {
        if (!idToApplyTo) idToApplyTo = id;
        else removePlugin(id);
      }

    idToApplyTo ??= remoteSrc.split("://").at(-1);

    if (idToApplyTo in loadedPlugins()) stopPlugin(idToApplyTo);

    if (newRemote.length > 1) pluginStorages[idToApplyTo] = newRemote[1];

    internalData[idToApplyTo] = {
      ...(internalData[idToApplyTo] || {}),
      local: false,
      on: false,
      update: newRemote[0].update ?? true,
      src: remoteSrc,
      js: newRemote[0].js ?? "",
      manifest: newRemote[0].manifest ?? {},
    };

    if (newRemote[0].on) startPlugin(idToApplyTo);
  }
}

export function verifyData(data: DataExport) {
  if (typeof data !== "object") return "Not an object";
  if (typeof data.dbStore !== "object") return "Missing dbStore";
  if (typeof data.localPlugins !== "object") return "Missing localPlugins";
  if (typeof data.remotePlugins !== "object") return "Missing remotePlugins";

  const verify = (remote: boolean, key: string) => {
    if (!key) return "Plugin with falsy ID";
    const p = (remote ? data.remotePlugins : data.localPlugins)[key];

    if (remote) {
      try {
        new URL(key);
      } catch {
        return "Remote plugin with invalid source URL";
      }
    }

    if (!Array.isArray(p)) return "Plugin value is not an array";
    if (p.length < 1 || p.length > 2) return "Plugin array wrong size";
    if (typeof p[0] !== "object") return "Plugin obj is not an object";
    if (p.length > 1 && typeof p[0] !== "object") return "Plugin storage is missing or not an object";

    if (typeof p[0].js !== "string") return "Local plugin missing JS or not string";
    if (typeof p[0].on !== "boolean") return "Local plugin missing enabledness or not boolean";
    if (typeof p[0].manifest !== "object") return "Local plugin missing manifest or not object";

    if (remote && typeof (p[0] as any).update !== "boolean") return "Remote plugin missing enabledness or not boolean";
  };

  for (const k in data.localPlugins) {
    const res = verify(false, k);
    if (res) return res;
  }

  for (const k in data.remotePlugins) {
    const res = verify(true, k);
    if (res) return res;
  }
}

export function importWouldConflict(data: DataExport) {
  for (const id in data.localPlugins) if (id in installedPlugins()) return true;

  for (const src in data.remotePlugins)
    for (const p of Object.values(installedPlugins())) if (src == p.src) return true;

  return false;
}
