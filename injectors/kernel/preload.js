const { ipcRenderer, webFrame } = require("electron");

ipcRenderer.invoke("_shelter_getBundle").then((bundle) => {
  webFrame.executeJavaScript(bundle);
});
