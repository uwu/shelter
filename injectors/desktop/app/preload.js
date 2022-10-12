const { resolve, join } = require("path");
const { readFileSync } = require("fs");
// TODO: Get CI working so I can replace placeholder url
const remoteUrl = process.env.SHELTER_BUNDLE_URL || "placeholder";
const localBundle = process.env.SHELTER_DIST_PATH;

(async () => {
  try {
    const originalPreload = require("./preload.json").path;
    require(originalPreload);

    if (localBundle) {
      // Can't inject into head since it doesn't exist yet
      let shelterBundle = readFileSync(resolve(join(localBundle, "shelter.js")), "utf8");
      shelterBundle += `\n//# sourceMappingURL=file:////${resolve(join(localBundle, "shelter.js.map"))}`;
      document.appendChild(document.createElement("script")).innerHTML = shelterBundle;
    } else {
      // Using fetch waits for too long and head becomes available
      let shelterBundle = await (await fetch(remoteUrl)).text();
      if (!shelterBundle.includes("//# sourceMappingURL=")) {
        shelterBundle += `\n//# sourceMappingURL=${remoteUrl + ".map"}`;
      }
      document.head.appendChild(document.createElement("script")).innerHTML = shelterBundle;
    }
  } catch (err) {
    if (localBundle) {
      require("electron").ipcRenderer.invoke("shelter-inject-fail", err);
    }
    console.error("[shelter-inject] Failed to inject.\n", err);
  }
})();
