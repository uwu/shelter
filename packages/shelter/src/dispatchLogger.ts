import { intercept } from "./flux";
import { log } from "./util";
import { dbStore, defaults } from "./storage";

defaults(dbStore, { logDispatch: false });

export const initDispatchLogger = () =>
  intercept((payload) => {
    if (dbStore.logDispatch) log(payload);
  });
