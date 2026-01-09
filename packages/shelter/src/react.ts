import exfiltrate from "./exfiltrate";

export let React, ReactDOM, ReactDOMClient;

// react developer tools' React is an experimental build, Discord's is not
// we need to queuemicrotask the filter & cleanup for this as otherwise react does not actually set the version in time
// RDT does not replace react-dom

exfiltrate(
  "useId",
  false,
  (r) => {
    if (r?.version && !r.version?.includes?.("experimental")) React = r;
    return false; // we want the last React that gets found
  },
  true,
);
exfiltrate("createPortal", false).then((v) => (ReactDOM = v));
exfiltrate("createRoot", false).then((v) => (ReactDOMClient = v));
