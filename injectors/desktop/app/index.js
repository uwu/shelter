const electron = require("electron");
const path = require("path");
const Module = require("module");
const fs = require("fs");
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

const shelterBundle = new Promise((resolve, reject) => {
  if (localBundle) {
    let data = fs.readFileSync(path.join(localBundle, "shelter.js"), "utf8");
    data += `\n//# sourceMappingURL=file:////${path.join(localBundle, "shelter.js.map")}`;

    resolve(data);
  } else {
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
  }
});
// #endregion

// #region IPC
electron.ipcMain.on("SHELTER_ORIGINAL_PRELOAD", (event) => {
  event.returnValue = event.sender.originalPreload;
});

electron.ipcMain.handle("SHELTER_BUNDLE_FETCH", () => shelterBundle);
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
