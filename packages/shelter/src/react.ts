import exfiltrate from "./exfiltrate";

export let React, ReactDOM;

// react developer tools' React is an experimental build, Discord's is not
// we need to queuemicrotask the filter & cleanup for this as otherwise react does not actually set the version in time
// RDT does not replace react-dom

exfiltrate("useId", false, (r) => r?.version && !r.version.includes("experimental"), true).then((v) => (React = v));
exfiltrate("findDOMNode", false).then((v) => (ReactDOM = v));
