const electron = require("electron");
const path = require("path");
const Module = require("module");
const fs = require("original-fs"); // using electron's fs causes app.asar to be locked during host updates
const https = require("https");

const logger = new Proxy(console, {
  get: (target, key) =>
    function (...args) {
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
function isNewerDir(newDir, oldDir) {
  const newParts = newDir.split("app-")[1].split(".");
  const oldParts = oldDir.split("app-")[1].split(".");
  for (let i = 0; i < newParts.length; i++) {
    const a = parseInt(newParts[i]);
    const b = parseInt(oldParts[i]);
    if (a > b) return true;
    if (a < b) return false;
  }
  return false;
}

function patchLatest() {
  try {
    const currentPath = path.join(__dirname, "..", "..");
    const localPath = path.join(currentPath, "..");

    const latestPath = path.join(
      localPath,
      fs
        .readdirSync(localPath)
        .filter((dir) => dir.startsWith("app-"))
        .reduce((prev, curr) => (isNewerDir(curr, prev) ? curr : prev)),
    );

    if (latestPath === currentPath) return;

    logger.log("Host update occured! Copying injector to new directory...");
    const newResourcesPath = path.join(latestPath, "resources");

    const newAppPath = path.join(newResourcesPath, "app");
    const oldAppPath = path.join(currentPath, "resources", "app");

    logger.log("Creating app directory in resources...");
    fs.mkdirSync(newAppPath, logger.error);

    fs.readdirSync(oldAppPath).forEach((file) => {
      logger.log("Copying", file);
      fs.copyFileSync(path.join(oldAppPath, file), path.join(newAppPath, file));
    });

    const appAsar = path.join(latestPath, "resources", "app.asar");
    const originalAsar = path.join(latestPath, "resources", "original.asar");

    if (!fs.existsSync(appAsar)) return;

    logger.log("Renaming app.asar -> original.asar...");
    fs.renameSync(appAsar, originalAsar);
  } catch (e) {
    logger.error("Host update error:", e);
  }
}

if (process.platform === "win32") {
  electron.app.on("before-quit", patchLatest);
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
