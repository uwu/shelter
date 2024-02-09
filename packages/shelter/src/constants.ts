import { before } from "spitroast";

export const constants = {};
const unpatch = before("defineProperty", Object, (args) => {
  if (args[1] === "MessageTypes") {
    queueMicrotask(() => {
      Object.assign(constants, args[0]);
    });
    unpatch();
  }
});
