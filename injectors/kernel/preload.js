const { contextBridge } = require("electron");
const https = require("https");
const fs = require("original-fs"); // asar!
const path = require("path");

// important note: electron waits for all js stacks in preload to terminate before moving on
// so we can safely do things async here and as long as by the end of it all the bundle is somewhere
// accesible by the next part we won't be at risk of late injection :)

console.log("[kernel-shelter/preload] Hello, World!");

//////////////////////////
// #region fetch shelter
//////////////////////////
const remoteUrl =
  process.env.SHELTER_BUNDLE_URL || "https://raw.githubusercontent.com/uwu/shelter-builds/main/shelter.js";
const localBundle = process.env.SHELTER_DIST_PATH;

let fetchPromise;

if (!localBundle)
  fetchPromise = new Promise((res, rej) => {
    const req = https.get(remoteUrl);

    req.on("response", (resp) => {
      const chunks = [];

      resp.on("data", (chunk) => chunks.push(chunk));
      resp.on("end", () => {
        let data = Buffer.concat(chunks).toString("utf-8");
        if (!data.includes("//# sourceMappingURL=")) data += `\n//# sourceMappingURL=${remoteUrl + ".map"}`;
        res(data);
      });
    });

    req.on("error", rej);

    req.end();
  });

const getShelterBundle = () =>
  !localBundle
    ? fetchPromise
    : Promise.resolve(
        fs.readFileSync(path.join(localBundle, "shelter.js"), "utf8") +
          `\n//# sourceMappingURL=file:////${path.join(localBundle, "shelter.js.map")}`,
      );

// #endregion

///////////////////////////
// #region inject shelter
///////////////////////////
getShelterBundle().then((bundle) => {
  contextBridge.exposeInMainWorld("KernelShelterNative", { bundle });
  console.log("[kernel-shelter/preload] Shelter fetched and exposed to renderer.");
});
