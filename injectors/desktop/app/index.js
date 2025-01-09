const electron = require("electron");
const path = require("path");
const Module = require("module");
const fs = require("original-fs"); // using electron's fs causes app.asar to be locked during host updates
const https = require("https");
const { EOL } = require("os");

// Write logs to a file, windows only, enabled by default
const enableFileLogging = process.platform === "win32" && process.env.SHELTER_FILE_LOGGING?.toLowerCase() !== "false";

let logFilePath;
let logFile;

// Set up a logging stream and truncate it's file if it's too large
if (enableFileLogging) {
  try {
    // the directory of this path only exists on windows
    logFilePath = path.resolve(__dirname, "../../../shelter-injector.log");
    if (fs.existsSync(logFilePath)) {
      const lines = fs.readFileSync(logFilePath).toString().split(EOL);
      if (lines > 100_000) {
        const truncatedContent = lines.slice(-75_000).join(EOL);
        fs.writeFileSync(logFilePath, truncatedContent);
      }
    }
    logFile = fs.createWriteStream(logFilePath, { flags: "a" });
  } catch (e) {
    console.error("Error setting up shelter-injector.log", e);
  }
}

const logger = new Proxy(console, {
  get: (target, key) =>
    function (...args) {
      logFile?.write(`[${new Date().toISOString()}] [${key}] ${args.join(" ")}${EOL}`);
      return target[key].apply(console, ["[shelter]", ...args]);
    },
});

logger.log("Loading...");

// #region Bundle
const remoteUrl =
  process.env.SHELTER_BUNDLE_URL || "https://raw.githubusercontent.com/uwu/shelter-builds/main/shelter.js";
const distPath = process.env.SHELTER_DIST_PATH;

let localBundle;

if (distPath) {
  localBundle =
    fs.readFileSync(path.join(distPath, "shelter.js"), "utf8") +
    `\n//# sourceMappingURL=file://${process.platform === "win32" ? "/" : ""}${path.join(distPath, "shelter.js.map")}`;
}

let remoteBundle;
let remoteBundlePromise;

const fetchRemoteBundleIfNeeded = () => {
  if (localBundle || remoteBundle) return Promise.resolve();

  remoteBundlePromise ??= new Promise((resolve) => {
    const req = https.get(remoteUrl);

    req.on("response", (res) => {
      if (res.statusCode !== 200) {
        remoteBundlePromise = null;
        resolve();
        return;
      }
      const chunks = [];

      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        let script = Buffer.concat(chunks).toString("utf-8");

        if (!script.includes("//# sourceMappingURL=")) script += `\n//# sourceMappingURL=${remoteUrl + ".map"}`;
        remoteBundle = script;
        remoteBundlePromise = null;
        resolve();
      });
    });

    req.on("error", (e) => {
      logger.error("Error fetching remote bundle:", e);
      remoteBundlePromise = null;
      resolve();
    });

    req.end();
  });

  return remoteBundlePromise;
};

fetchRemoteBundleIfNeeded();

const getShelterBundle = () => {
  if (localBundle) return localBundle;
  if (remoteBundle) return remoteBundle;
  return `console.error("[shelter] Bundle could not be fetched in time. Aborting!");`;
};

// #endregion

// #region IPC
electron.ipcMain.on("SHELTER_ORIGINAL_PRELOAD", (event) => {
  event.returnValue = event.sender.originalPreload;
});

electron.ipcMain.handle("SHELTER_BUNDLE_FETCH", getShelterBundle);
// #endregion

// #region CSP
electron.app.on("ready", () => {
  electron.session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders }, done) => {
    const cspHeaders = Object.keys(responseHeaders).filter((name) =>
      name.toLowerCase().startsWith("content-security-policy"),
    );

    for (const header of cspHeaders) {
      delete responseHeaders[header];
    }

    done({ responseHeaders });
  });

  electron.session.defaultSession.webRequest.onHeadersReceived = () => {};
});
// #endregion

// #region Windows host updates
function patchLatest() {
  try {
    // Before quit we inject our files into all app-* directories (newer and older versions)
    // to account for both host updates and rollbacks
    const currentAppDir = path.join(__dirname, "..", "..");
    const localDir = path.join(currentAppDir, "..");

    const appDirs = fs
      .readdirSync(localDir, { withFileTypes: true })
      .filter(
        (entry) =>
          entry.name.startsWith("app-") &&
          !currentAppDir.endsWith(entry.name) &&
          entry.isDirectory() &&
          fs.existsSync(path.join(localDir, entry.name, "resources")),
        // If the app-* directory is empty and missing this subdirectory,
        // we assume it's an old version that Discord will delete soon
      )
      .map((entry) => entry.name);

    logger.log(`Current app path: ${currentAppDir}`);
    if (appDirs.length === 0) {
      logger.log("Done! No other app-* directories found.");
      return;
    }
    logger.log(`Found the following app-* directory candidates: ${appDirs}`);

    const resourcesSrc = path.join(currentAppDir, "resources");
    const appSrc = path.join(resourcesSrc, "app");

    appDirs.forEach((appDir) => {
      try {
        logger.log(`Injecting files into: ${appDir}`);
        const resourcesDest = path.join(localDir, appDir, "resources");
        const appDest = path.join(resourcesDest, "app");

        const copyDirRecursive = (from, to) => {
          if (!fs.existsSync(to)) fs.mkdirSync(to);
          fs.readdirSync(from).forEach((element) => {
            if (fs.existsSync(path.join(to, element))) {
              logger.log(`Element already exists: ${element}`);
              return;
            }
            if (fs.lstatSync(path.join(from, element)).isFile()) {
              fs.copyFileSync(path.join(from, element), path.join(to, element));
            } else {
              copyDirRecursive(path.join(from, element), path.join(to, element));
            }
          });
        };

        copyDirRecursive(appSrc, appDest);
        logger.log(`Copied all injector files.`);

        const appAsar = path.join(resourcesDest, "app.asar");
        const originalAsar = path.join(resourcesDest, "original.asar");

        if (fs.existsSync(appAsar)) {
          logger.log("Renaming app.asar -> original.asar");
          fs.renameSync(appAsar, originalAsar);
        }
      } catch (e) {
        logger.error(`Error while injecting (${appDir}): ${e.message}${EOL}${e.stack}`);
      }
    });
    logger.log("Finished injecting our files into all directories!");
  } catch (e) {
    logger.error(`Host update error: ${e.message}${EOL}${e.stack}`);
  }
}

if (process.platform === "win32") {
  electron.app.on("before-quit", patchLatest);
}

// #endregion

// #region DevTools
// Patch DevTools setting, enabled by default
const enableDevTools = process.env.SHELTER_FORCE_DEVTOOLS?.toLowerCase() !== "false";

if (enableDevTools) {
  const originalRequire = Module.prototype.require;

  Module.prototype.require = function (path) {
    const loadedModule = originalRequire.call(this, path);
    if (!path.endsWith("appSettings")) return loadedModule;

    const settings =
      loadedModule?.appSettings?.getSettings?.() ?? // Original
      loadedModule?.getSettings?.(); // OpenAsar

    if (settings?.get) {
      try {
        const origGet = settings.get;
        settings.get = function (key, defaultValue) {
          if (key === "DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING") {
            return true;
          }
          return origGet.apply(this, [key, defaultValue]);
        };
        Module.prototype.require = originalRequire;
      } catch (e) {
        logger.error(`Error patching DevTools setting: ${e}${EOL}${e.stack}`);
      }
    }
    return loadedModule;
  };
}

// #endregion

// #region BrowserWindow
const ProxiedBrowserWindow = new Proxy(electron.BrowserWindow, {
  construct(target, args) {
    const options = args[0];
    let originalPreload;

    if (options.webPreferences?.preload && options.title) {
      originalPreload = options.webPreferences.preload;
      // We replace the preload instead of using setPreloads because of some
      // differences in internal behaviour.
      options.webPreferences.preload = path.join(__dirname, "preload.js");
    }

    const window = new target(options);
    window.webContents.originalPreload = originalPreload;

    // Make sure the bundle has been fetched before loading the site
    const originalLoadURL = window.loadURL;
    window.loadURL = async function (url) {
      // Optionally refetch in case the initial fetch failed
      if (url.includes("discord.com/app")) await fetchRemoteBundleIfNeeded();
      return await originalLoadURL.apply(this, arguments);
    };
    return window;
  },
});

const electronPath = require.resolve("electron");
delete require.cache[electronPath].exports;
require.cache[electronPath].exports = {
  ...electron,
  BrowserWindow: ProxiedBrowserWindow,
};

// #endregion

logger.log("Starting original...");
// #region Start original
let originalPath = path.join(process.resourcesPath, "app.asar");
if (!fs.existsSync(originalPath)) originalPath = path.join(process.resourcesPath, "original.asar");

const originalPackage = require(path.resolve(path.join(originalPath, "package.json")));
const startPath = path.join(originalPath, originalPackage.main);

require.main.filename = startPath;
electron.app.setAppPath?.(originalPath);
electron.app.name = originalPackage.name;

Module._load(startPath, null, true);
// #endregion
