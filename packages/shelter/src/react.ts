import exfiltrate from "./exfiltrate";

import * as _R from "react";
import * as _RDOM from "react-dom";
import * as _RDOMClient from "react-dom/client";

type TReact = typeof _R;
type TRDOM = typeof _RDOM;
type TRDOMClient = typeof _RDOMClient;

export let React: TReact, ReactDOM: TRDOM, ReactDOMClient: TRDOMClient;

// react developer tools' React is an experimental build, Discord's is not
// we need to queuemicrotask the filter & cleanup for this as otherwise react does not actually set the version in time
// RDT does not replace react-dom

exfiltrate("useId", false, (r) => r?.version && !r.version?.includes?.("experimental"), true).then((v) => (React = v));
exfiltrate("createPortal", false).then((v) => (ReactDOM = v));
exfiltrate("createRoot", false).then((v) => (ReactDOMClient = v));
