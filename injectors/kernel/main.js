const { app, session } = require("electron");

console.log("[kernel-shelter/main] Hello, World!");

app.on("ready", () => {
  // remove Content-Security-Policy header
  session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders }, done) => {
    const cspHeaders = Object.keys(responseHeaders).filter((name) =>
      name.toLowerCase().startsWith("content-security-policy"),
    );

    for (const header of cspHeaders) delete responseHeaders[header];

    done({ responseHeaders });
  });

  // stop other modification
  //session.defaultSession.webRequest.onHeadersReceived = () => console.warn("[kernel-shelter/main] Prevented someone else from modifying request headers.");

  console.log("[kernel-shelter/main] Removed CSP.");
});
