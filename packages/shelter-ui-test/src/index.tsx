/* @refresh reload */
import { render } from "solid-js/web";

import { initToasts } from "@uwu/shelter-ui";

import "shelter-ui/compat.css";
import "./index.css";
import App from "./App";

const root = document.getElementById("root");

initToasts(document.body);

render(() => <App />, root!);
