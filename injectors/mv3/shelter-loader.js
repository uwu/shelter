const SHELTER_URL = "https://raw.githubusercontent.com/uwu/shelter-builds/main/shelter.js";

// discord removes localStorage from window so we get it through an iframe
const iframe = document.createElement("iframe");
iframe.style.display = "none";
document.documentElement.append(iframe);
const { localStorage } = iframe.contentWindow;

async function fetchShelter() {
  const shelter = await (await fetch(SHELTER_URL)).text();
  return `${shelter}\n//# sourceMappingURL=${SHELTER_URL}.map`;
}

async function initShelter() {
  const localShelter = localStorage.getItem("shelter-bundle");

  if (localShelter) {
    const script = document.createElement("script");
    script.innerText = localShelter;
    document.documentElement.append(script);
  }

  const remoteShelter = await fetchShelter();
  if (remoteShelter === localShelter) return;

  localStorage.setItem("shelter-bundle", remoteShelter);
  window.location.reload();
}

initShelter();
