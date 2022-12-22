// shoutouts to Phorcys
// https://github.com/CumcordLoaders/Browser/blob/main/mv3/src/loader.js

function patchFetch() {
  window.fetch = async (...args) => {
    const url = args[0] instanceof URL ? args[0].href : args[0];
    const result = await communicate({ type: "fetch", url, options: args[1] ?? {} }, "/extid/");

    if (result.error) throw new (window[result.error.type] ?? Error)(result.error.text);
    const headers = new Headers(result.headers ?? {});

    let res = new Response(result.text, result.init);
    Object.defineProperties(res, {
      url: {
        value: url,
        writable: false,
      },

      headers: {
        value: headers,
        writable: false,
      },
    });

    return res;
  };
}

async function communicate(data, extid, timeout = 2000) {
  let port = chrome.runtime.connect(extid, { name: (Math.random() + 1).toString(36).substring(7) });

  return new Promise((resolve, reject) => {
    let listener = (msg) => {
      port.onMessage.removeListener(listener);
      port.disconnect();
      return resolve(msg);
    };

    port.onMessage.addListener(listener);
    port.postMessage(data);

    if (timeout !== Infinity) {
      setTimeout(() => {
        port.onMessage.removeListener(listener);
        port.disconnect();
        reject(new Error("Request timed out."));
      }, timeout);
    }
  });
}

// We remove CSP for discord.com/* via DNR
// however keep this here just to be sure ;)
patchFetch();

// This gets replaced by the worker at runtime
/* INJECT_SHELTER_SOURCE */
