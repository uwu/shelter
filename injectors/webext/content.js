const SHELTER_URL = "https://raw.githubusercontent.com/uwu/shelter-builds/main/shelter.js";
async function fetchShelter() {
  const shelter = await (await fetch(SHELTER_URL)).text();

  return `${shelter}
//# sourceMappingURL=${SHELTER_URL}.map`;
}

async function updateShelter() {
  const [{ shelter: existingShelter }, newShelter] = await Promise.all([
    chrome.storage.local.get("shelter"),
    fetchShelter(),
  ]);

  if (existingShelter === newShelter) return;

  await chrome.storage.local.set({ shelter: newShelter });

  location.reload();
}

(async () => {
  try {
    const { shelter } = await chrome.storage.local.get("shelter");

    if (shelter) {
      const scriptTag = document.createElement("script");
      scriptTag.textContent = shelter;

      document.head.append(scriptTag);
    }

    await updateShelter();
  } catch (e) {
    console.error("SHELTER-INJ EXT ERR", e);
  }
})();
