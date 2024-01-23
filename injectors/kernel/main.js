const { ipcMain } = require("electron");
const { promises: fs } = require("original-fs");
const https = require("https");
const path = require("path");
const config = require("./index.json");

const sourceType = config.settings?.sourceType || "remote";
const sourcePath =
  config.settings?.sourcePath || "https://raw.githubusercontent.com/uwu/shelter-builds/main/shelter.js";

console.log(`[kernel-shelter] Loading shelter from ${sourceType} "${sourcePath}"`);

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

ipcMain.handle("_shelter_getBundle", () => bundle);
