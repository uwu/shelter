const SHELTER_URL = "https://raw.githubusercontent.com/uwu/shelter-builds/main/shelter.js";
async function fetchShelter() {
  const shelter = await (await fetch(SHELTER_URL)).text();

  return `${shelter}
//# sourceMappingURL=${SHELTER_URL}.map`;
}

// why does chrome have to be like this?
// firefox does it fine, be like firefox.
const promisifiedGet = (...a) => new Promise((res) => chrome.storage.local.get(...a, res));

async function updateShelter(tabId) {
  const [{ shelter: existingShelter }, newShelter] = await Promise.all([promisifiedGet("shelter"), fetchShelter()]);

  if (existingShelter === newShelter) return;

  await chrome.storage.local.set({ shelter: newShelter });

  inject(tabId, `location.reload()`);
}

// shoutouts to Phorcys
// https://github.com/CumcordLoaders/Browser/blob/main/mv3/src/worker.js

function inject(tabId, code, detachOnFinish = true) {
  chrome.debugger.attach(
    {
      tabId,
    },
    "1.3",
    () => {
      chrome.debugger.sendCommand(
        {
          tabId,
        },
        "Runtime.evaluate",
        {
          expression: code,
          allowUnsafeEvalBlockedByCSP: true,
        },
        () => {
          if (detachOnFinish) chrome.debugger.detach({ tabId });
        },
      );
    },
  );
}

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  sendResponse();

  if (msg === "pwnme" && new URL(sender.tab.url).pathname !== "/") {
    const loader = await (await fetch(chrome.runtime.getURL("loader.js"))).text();
    const { shelter } = await promisifiedGet("shelter");

    if (shelter) {
      // replace needs a function because dist usually contains "$&" which puts doit() in random places and produces syntax errors
      inject(
        sender.tab.id,
        loader.replace("/extid/", chrome.runtime.id).replace("/* INJECT_SHELTER_SOURCE */", () => shelter),
      );
    }

    await updateShelter(sender.tab.id);
  }
});

chrome.runtime.onConnectExternal.addListener((port) => {
  function messageHandler(msg) {
    if (msg.type) {
      if (msg.type === "fetch" && msg.url) {
        fetch(msg.url, msg.options)
          .then(async (res) => {
            if (port.onMessage.hasListener(messageHandler)) {
              port.postMessage({
                text: await res.text(),
                headers: Object.fromEntries([...res.headers]),

                init: {
                  status: res.status,
                  statusText: res.statusText,
                },
              });
            }
          })
          .catch((e) => {
            let error = e.toString().split(": ");

            if (port.onMessage.hasListener(messageHandler)) {
              port.postMessage({
                error: {
                  type: error[0],
                  text: error[1],
                },
              });
            }
          });
      }
    }
  }

  async function disconnectHandler() {
    port.onMessage.removeListener(messageHandler);
    port.disconnect();
    port.onDisconnect.removeListener(disconnectHandler);
  }

  port.onMessage.addListener(messageHandler);
  port.onDisconnect.addListener(disconnectHandler);
});
