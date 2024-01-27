const { ipcMain, app, session } = require("electron");
const { promises: fs } = require("original-fs");
const https = require("https");
const path = require("path");
const config = require("./index.json");

// completely disable CSP
console.log("[kernel-shelter] Disabling CSP");
// other injectors might get to onHeadersReceived first and modify it, so to prevent that we'll patch over it
// before the app is even ready.
// sorry mod authors, I WILL win the CSP modification fight against you, just watch me.

const origGetter = Object.getOwnPropertyDescriptor(session, "defaultSession").get;

delete session.defaultSession;
let cspIsPatched = false;
Object.defineProperty(session, "defaultSession", {
  enumerable: true,
  configurable: false, // remember when I said I WILL win?
  get() {
    const dsess = origGetter();
    console.log("[kernel-shelter] Intercepted electron.session.defaultSession getter.");

    // if we are here, then app must be ready, as this getter throws when not ready
    // this means it's safe to patch CSP now without doing any further waiting

    if (!cspIsPatched) {
      dsess.webRequest.onHeadersReceived(({ responseHeaders, resourceType }, done) => {
        const cspHeaders = Object.keys(responseHeaders).filter(
          (name) =>
            name.toLowerCase().startsWith("content-security-policy") ||
            name.toLowerCase().startsWith("access-control-allow-origin"),
        );

        // what the hell is wrong with vencord
        // oh well we'll just implement their weird choices so as to maintain compatibility because
        // the #1 priority of this shelter injection method is vencord compatibility.
        if (resourceType === "stylesheet") {
          const header = Object.keys(responseHeaders).find((h) => h.toLowerCase() === "content-type") ?? "content-type";
          responseHeaders[header] = "text/css";
        }

        for (const header of cspHeaders) delete responseHeaders[header];

        // Allow loading content from sites that don't allow CORS, like raw.githubusercontent.com
        // Vencord's uses this for text/css sources only to allow this specific site
        // This is their rationale for trying to stop other mods trampling theirs so if we not only fix it for us but
        // fix it for them too, then I think we come to a pretty agreeable solution ;)
        // We do, however, leave headers, methods, and other CORS headers intact, to prevent breakages.
        responseHeaders["Access-Control-Allow-Origin"] = "*";

        done({ responseHeaders });
      });

      // I promise, I tested leaving this as is to give other client mods the benefit of the doubt.
      // With Vencord too, our callback doesn't get run, so to prevent it from being trampled, we'll just do it here.
      dsess.webRequest.onHeadersReceived = () => {};

      console.log("[kernel-shelter] Patched CSP before handing back to getter source.");
      cspIsPatched = true;
    }

    return dsess;
  },
});

// Call the getter just in case another mod isn't there to do it for us. This patches CSP in that case.
app.on("ready", () => session.defaultSession);

// read config
const sourceType = config.settings?.sourceType || "remote";
const sourcePath =
  config.settings?.sourcePath || "https://raw.githubusercontent.com/uwu/shelter-builds/main/shelter.js";

console.log(`[kernel-shelter] Loading shelter from ${sourceType} "${sourcePath}"`);

// fetch shelter
let bundle;
if (sourceType === "remote") {
  bundle = new Promise((resolve, reject) => {
    const req = https.get(sourcePath);

    req.on("response", (res) => {
      const chunks = [];

      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        let data = Buffer.concat(chunks).toString("utf8");

        if (!data.includes("//# sourceMappingURL=")) {
          data += `\n//# sourceMappingURL=${sourcePath + ".map"}`;
        }

        resolve(data);
      });
    });

    req.on("error", reject);
    req.end();
  });
} else {
  const resolved = path.resolve(sourcePath);
  bundle = fs.readFile(resolved, "utf8").then((v) => v + `\n//# sourceMappingURL=file://${resolved}.map`);
}

// handle injecting shelter
ipcMain.handle("_shelter_getBundle", () => bundle);
