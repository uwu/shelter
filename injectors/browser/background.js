const SHELTER_URL = "https://raw.githubusercontent.com/uwu/shelter-builds/main/shelter.js";
const fetchShelter = () =>
  fetch(SHELTER_URL)
    .then((r) => r.text())
    .then(
      (s) => `${s}
//# sourceMappingURL=${SHELTER_URL}.map`,
    );

const getCachedShelter = () => chrome.storage.local.get("shelter").then((r) => r.shelter);
const setCachedShelter = (v) => chrome.storage.local.set({ shelter: v });

async function updateShelter() {
  const [existingShelter, newShelter] = await Promise.all([getCachedShelter(), fetchShelter()]);
  if (existingShelter === newShelter) return false;
  await setCachedShelter(newShelter);
  return true;
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") updateShelter();
});

chrome.runtime.onMessage.addListener(async (_, sender) => {
  const code = await getCachedShelter();
  if (code) {
    chrome.scripting.executeScript({
      args: [code],
      func: (code) => {
        (0, eval)(code);
      },
      injectImmediately: true,
      target: {
        tabId: sender.tab.id,
      },
      world: "MAIN",
    });
  }
  return updateShelter();
});
