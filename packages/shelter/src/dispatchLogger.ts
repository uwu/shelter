import { after } from "spitroast";
import { getDispatcher } from "./flux";
import { log } from "./util";
import { dbStore, defaults } from "./storage";

// TODO: This should be rewritten when we have proper dispatch intercepting!
defaults(dbStore, { logDispatch: false });

const logFunc = (payload) => {
  if (dbStore.logDispatch) log(payload);
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
