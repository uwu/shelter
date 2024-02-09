import { before } from "spitroast";

let resolveConstants: (val: Record<string, any>) => void;
export const constants = new Promise<Record<string, any>>((resolve) => (resolveConstants = resolve));

const unpatch = before("defineProperty", Object, (args) => {
  if (args[1] === "MessageTypes") {
    resolveConstants(args[0]);
    unpatch();
  }
});
