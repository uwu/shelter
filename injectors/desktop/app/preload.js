const SHELTER_DIST = "PLACEHOLDER";

const isDevMode = process.env.SHELTER_LOCAL_FILE !== undefined;

(async () => {
    try {
        const originalPreload = require("./preload.json").path;
        let shelterBundle = null;
        if(isDevMode) {
            shelterBundle = require("fs").readFileSync(process.env.SHELTER_LOCAL_FILE, "utf8");
        } else {
            shelterBundle = await (await fetch(SHELTER_DIST)).text();
        }
        document.appendChild(document.createElement("script")).innerHTML = shelterBundle;
        require(originalPreload);
    }
    catch(e) {
        console.error("[shelter-inject] Failed to inject.", e);
    }
})();