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
const localBundle = process.env.SHELTER_DIST_PATH;

let fetchPromise; // only fetch once

if (!localBundle)
  fetchPromise = new Promise((resolve, reject) => {
    const req = https.get(remoteUrl);

    req.on("response", (res) => {
      const chunks = [];

      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        let data = Buffer.concat(chunks).toString("utf-8");

        if (!data.includes("//# sourceMappingURL=")) data += `\n//# sourceMappingURL=${remoteUrl + ".map"}`;

        resolve(data);
      });
    });

    req.on("error", reject);

    req.end();
  });

const getShelterBundle = () =>
  !localBundle
    ? fetchPromise
    : Promise.resolve(
        fs.readFileSync(path.join(localBundle, "shelter.js"), "utf8") +
          `\n//# sourceMappingURL=file://${process.platform === "win32" ? "/" : ""}${path.join(
            localBundle,
            "shelter.js.map",
          )}`,
      );
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

        if (fs.existsSync(appDest)) {
          logger.log("App directory already exists.");
        } else {
          logger.log("Creating app directory in resources..");
          fs.mkdirSync(appDest, logger.error);
        }

        fs.readdirSync(appSrc).forEach((file) => {
          if (fs.existsSync(file)) {
            logger.log(`File already exists: ${file}`);
          } else {
            logger.log(`Copying ${file}`);
            fs.copyFileSync(path.join(appSrc, file), path.join(appDest, file));
          }
        });

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
    const settings = loadedModule?.appSettings?.getSettings()?.settings;
    if (settings) {
      try {
        Object.defineProperty(settings, "DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING", {
          value: true,
          configurable: false,
          enumerable: false, // prevents our patched value from getting saved to settings.json
        });
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
