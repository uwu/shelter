const { webFrame, ipcRenderer } = require("electron");

const bundle = ipcRenderer.sendSync("SHELTER_FHDIUSF");
if (bundle)
  // document.appendChild(document.createElement("script")).innerHTML = bundle;
  webFrame.executeJavaScript(bundle);
const originalPreload = require("./preload.json").path;
require(originalPreload);
