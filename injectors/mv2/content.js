const SHELTER_URL = "https://raw.githubusercontent.com/uwu/shelter-builds/main/shelter.js";
async function fetchShelter() {
  const shelter = await (await fetch(SHELTER_URL)).text();

  return `${shelter}
//# sourceMappingURL=${SHELTER_URL}.map`;
}

// why does chrome have to be like this?
// firefox does it fine, be like firefox.
const promisifiedGet = (...a) => new Promise((res) => chrome.storage.local.get(...a, res));

async function updateShelter() {
  const [{ shelter: existingShelter }, newShelter] = await Promise.all([promisifiedGet("shelter"), fetchShelter()]);

  if (existingShelter === newShelter) return;

  await chrome.storage.local.set({ shelter: newShelter });

  location.reload();
}

(async () => {
  try {
    const { shelter } = await promisifiedGet("shelter");

    if (shelter) {
      const scriptTag = document.createElement("script");
      scriptTag.textContent = shelter;

      while (!document.head) await new Promise(setTimeout);
      document.head.append(scriptTag);
    }

    await updateShelter();
  } catch (e) {
    console.error("SHELTER-INJ EXT ERR", e);
  }
})();
