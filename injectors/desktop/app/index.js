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

electron.ipcMain.handle("shelter-inject-fail", (ev, err) => {
  console.error("[shelter-inject] Failed to inject.\n", err);
  const options = {
      type: 'error',
      buttons: ['Continue', 'Close Discord'],
      defaultId: 0,
      cancelId: 1,
      message: 'Shelter failed to load from local dist. \nCheck console for more info.',
      detail: err.message
  };
  let pressedButtonId = electron.dialog.showMessageBoxSync(null, options);
  if(pressedButtonId == 1) {
    process.exit()
  }
  return 0;
})

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

let injected = false;

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
        if(opts.resizable && !injected) { // Prevents injecting into splash screen since it's not resizable
          let originalPreload = JSON.stringify({path:opts.webPreferences.preload});
          fs.writeFileSync(path.join(basePath, "app", "preload.json"), originalPreload);
          opts.webPreferences.preload = path.join(basePath, "app", "preload.js");
          injected = true;  
        }
        
        const window = new BrowserWindow(opts);
        return window;
      }
    } : electron[propertyName]
  })
}

electronCache.exports = newElectron;
module.exports = require(originalAppPath);