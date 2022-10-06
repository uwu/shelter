import getDispatcher from "./getDispatcher";
import * as patcher from "spitroast";
import * as solid from "solid-js";

// We can move this somewhere else, I just put it here for now.
function log(text) {
  console.log("%cshelter%c", "background: linear-gradient(180deg, #2A3B4B 0%, #2BFAAC 343.17%); color: white; padding: 6px", "", text)
}

const start = performance.now()
log("shelter is initializing...")

getDispatcher().then(FluxDispatcher => {
  // We can potentially move the window obj to it's own module later, I think it'd help with typedefs?
  window["shelter"] = {
    FluxDispatcher,
    patcher,
    solid,
  }

  log(`shelter is initialized. took: ${(performance.now() - start).toFixed(1)}ms`)
})