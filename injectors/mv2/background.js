// csp be gon
chrome.webRequest.onHeadersReceived.addListener(
  ({ responseHeaders }) => {
    responseHeaders = responseHeaders.filter((header) => header.name.toLowerCase() !== "content-security-policy");

    return { responseHeaders };
  },

  { urls: ["*://*.discord.com/*", "*://discord.com/*"] },
  ["blocking", "responseHeaders"],
);
