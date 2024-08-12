const { ipcRenderer, webFrame } = require("electron");

ipcRenderer.invoke("SHELTER_BUNDLE_FETCH").then((bundle) => {
  webFrame.executeJavaScript(bundle);
});

const originalPreload = ipcRenderer.sendSync("SHELTER_ORIGINAL_PRELOAD");
if (originalPreload) require(originalPreload);
