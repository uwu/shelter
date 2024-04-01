import exfiltrate from "./exfiltrate";

export let React, ReactDOM;

exfiltrate("useId", false).then((v) => (React = v));
exfiltrate("findDOMNode", false).then((v) => (ReactDOM = v));
