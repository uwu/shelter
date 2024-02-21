const script = document.createElement("script");
script.src = chrome.runtime.getURL("shelter-loader.js");

document.head.append(script);
