import { after } from "spitroast";
import { DiscordHTTP } from "./types";

export let discordHttp: DiscordHTTP;

const unpatch = after("bind", Function.prototype, function (args, res) {
  if (args.length !== 2 || args[0] !== null || args[1] !== "get") return;
  unpatch();
  return function (...args) {
    // I don't know why, but for the first call `this` is Window
    if (this !== window) {
      discordHttp = this;
      this.get = res;
    }
    return res(args);
  };
});
