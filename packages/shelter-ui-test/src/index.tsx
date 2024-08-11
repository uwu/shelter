/* @refresh reload */
import { render } from "solid-js/web";

import { initToasts, injectInternalStyles } from "@uwu/shelter-ui";

import "@uwu/shelter-ui/compat.css";
import "./index.css";
import App from "./App";

const root = document.getElementById("root");

initToasts(document.body);
injectInternalStyles();

render(() => <App />, root!);
