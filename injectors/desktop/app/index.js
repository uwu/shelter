const electron = require("electron");
const path = require("path");
const fs = require("fs");

const basePath = path.join(path.dirname(require.main.filename), "..");
let originalAppPath = path.join(basePath, "app.asar");

const originalPackage = require(path.resolve(path.join(originalAppPath, "package.json")));

require.main.filename = path.join(originalAppPath, originalPackage.main);

electron.app.setAppPath(originalAppPath);
electron.app.name = originalPackage.name;
//#endregion

const electronCache = require.cache[require.resolve("electron")];

//#region CSP Removal
electron.app.on("ready", () => {
  // Removes CSP
  electron.session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders }, done) => {
    const cspHeaders = Object.keys(responseHeaders).filter((name) =>
      name.toLowerCase().startsWith("content-security-policy")
    );

    for (const header of cspHeaders) {
      delete responseHeaders[header];
    }

    done({ responseHeaders });
  });

  // Prevents other mods from removing CSP
  electronCache.exports.session.defaultSession.webRequest.onHeadersReceived = () => {
    console.log("[RawDog] Prevented CSP from being modified...");
  };
});
//#endregion

let injected = false;

const { BrowserWindow } = electron;
const propertyNames = Object.getOwnPropertyNames(electronCache.exports);

delete electronCache.exports;
// Make a new electron that will use the new 'BrowserWindow'
const newElectron = {};
for (const propertyName of propertyNames) {
  Object.defineProperty(newElectron, propertyName, {
    ...Object.getOwnPropertyDescriptor(electron, propertyName),
    get: () =>
      propertyName === "BrowserWindow"
        ? class extends BrowserWindow {
            constructor(opts) {
              if (opts.resizable && !injected) {
                // Prevents injecting into splash screen since it's not resizable
                let originalPreload = JSON.stringify({ path: opts.webPreferences.preload });
                fs.writeFileSync(path.join(basePath, "app", "preload.json"), originalPreload);
                opts.webPreferences.preload = path.join(basePath, "app", "preload.js");
                injected = true;
              }

              const window = new BrowserWindow(opts);
              return window;
            }
          }
        : electron[propertyName],
  });
}

electronCache.exports = newElectron;

// holy shit i'm so stressed right now and i should not be coding at 1am
// i hope it works
// i can't think straight with this headache ugh
// this is just a quick fix sorry for making this even more disgusting
(async () => {
  let shelterBundle = "";
  const remoteUrl =
    process.env.SHELTER_BUNDLE_URL || "https://raw.githubusercontent.com/uwu/shelter-builds/main/shelter.js";
  const localBundle = process.env.SHELTER_DIST_PATH;

  try {
    if (localBundle) {
      shelterBundle = readFileSync(resolve(join(localBundle, "shelter.js")), "utf8");
      shelterBundle += `\n//# sourceMappingURL=file:////${resolve(join(localBundle, "shelter.js.map"))}`;
    } else {
      // shelterBundle = await (await fetch(remoteUrl)).text();

      let done = false;
      const http = require("https"); // fucking hell
      http.get(remoteUrl, (res) => {
        res.on("data", (d) => {
          shelterBundle += d;
        });
        res.on("end", () => (done = true));
      });

      while (!done)
        // don't say i didn't warn you
        await new Promise((r) => setTimeout(r));

      if (!shelterBundle.includes("//# sourceMappingURL=")) {
        shelterBundle += `\n//# sourceMappingURL=${remoteUrl + ".map"}`;
      }
    }
  } catch (err) {
    console.error("[shelter-inject] Failed to inject.\n", err);
    const options = {
      type: "error",
      buttons: ["Continue", "Close Discord"],
      defaultId: 0,
      cancelId: 1,
      message: "Shelter failed to load from local dist. \nCheck console for more info.",
      detail: err.message,
    };
    let pressedButtonId = electron.dialog.showMessageBoxSync(null, options);
    if (pressedButtonId == 1) {
      process.exit();
    }
  }

  electron.ipcMain.on("SHELTER_FHDIUSF", (event) => {
    event.returnValue = shelterBundle;
  });

  console.log("[shelter-inject] early load hopefully successful");

  module.exports = require(originalAppPath);
})();
