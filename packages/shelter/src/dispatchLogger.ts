import { after } from "spitroast";
import { getDispatcher } from "./dispatcher";
import { log } from "./util";
import { createSignal } from "solid-js";

// TODO: This should be rewritten when we have proper dispatch intercepting!

export let [isLogging, setLoggingState] = createSignal(false); // who says these are only for UI? --sink

const logFunc = (payload) => {
  if (isLogging()) log(payload);
};

export async function initDispatchLogger() {
  let toUnpatch;
  const dispatcher = await getDispatcher();
  if (dispatcher._interceptor) {
    toUnpatch = after("_interceptor", dispatcher, (args) => {
      logFunc(args[0]);
    });
  } else {
    dispatcher.setInterceptor(logFunc);
    toUnpatch = () => dispatcher.setInterceptor();
  }

  return () => toUnpatch();
}
