import { after } from "spitroast";
import { getDispatcher } from "./dispatcher";
import { log } from "./util";

// TODO: This should be rewritten when we have proper dispatch intercepting!

export let isLogging = false;

const logFunc = (payload) => {
  if (isLogging) {
    log(payload);
  }
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

export const setLoggingState = (state: boolean) => (isLogging = state);
