import exfiltrate from "./exfiltrate";

export let React, ReactDOM;

exfiltrate("useId").then((v) => (React = v));
exfiltrate("findDOMNode").then((v) => (ReactDOM = v));
