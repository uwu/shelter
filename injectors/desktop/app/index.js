const electron = require("electron");
const path = require("path");
const fs = require("fs");

const basePath = path.join(path.dirname(require.main.filename), "..");
let originalAppPath = path.join(basePath, "app.asar");

const originalPackage = require(path.resolve(
  path.join(originalAppPath, "package.json")
));

require.main.filename = path.join(originalAppPath, originalPackage.main);

electron.app.setAppPath(originalAppPath);
electron.app.name = originalPackage.name;
//#endregion

const electronCache = require.cache[require.resolve("electron")];

//#region CSP Removal
electron.app.on("ready", () => {
  // Removes CSP
  electron.session.defaultSession.webRequest.onHeadersReceived(
    ({ responseHeaders }, done) => {
      const cspHeaders = Object.keys(responseHeaders).filter((name) =>
        name.toLowerCase().startsWith("content-security-policy")
      );

      for (const header of cspHeaders) {
        delete responseHeaders[header];
      }

      done({ responseHeaders });
    }
  );

  // Prevents other mods from removing CSP
  electronCache.exports.session.defaultSession.webRequest.onHeadersReceived =
    () => {
      console.log("[RawDog] Prevented CSP from being modified...");
    };
});
//#endregion

const { BrowserWindow } = electron;
const propertyNames = Object.getOwnPropertyNames(electronCache.exports);

delete electronCache.exports;
// Make a new electron that will use the new 'BrowserWindow'
const newElectron = {}
for (const propertyName of propertyNames) {
  Object.defineProperty(newElectron, propertyName, {
    ...Object.getOwnPropertyDescriptor(electron, propertyName),
    get: () => propertyName === "BrowserWindow" ? class extends BrowserWindow {
      constructor(opts) {
        let originalPreload = JSON.stringify({path:opts.webPreferences.preload});
        fs.writeFileSync(path.join(basePath, "app", "preload.json"), originalPreload);
        opts.webPreferences.preload = path.join(basePath, "app", "preload.js");

        const window = new BrowserWindow(opts);
        return window;
      }
    } : electron[propertyName]
  })
}

electronCache.exports = newElectron;
module.exports = require(originalAppPath);