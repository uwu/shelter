import { after, instead } from "spitroast";
import { DiscordHTTP, HTTPRequest, HTTPResponse } from "./types";

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

export let unpatchHttpHandlers;
function patchHttpHandlers() {
  if (unpatchHttpHandlers) return;
  const patches = ["get", "post", "put", "patch", "delete"].map((f) =>
    instead(f, discordHttp, async (args, original) => {
      let req = args[0];
      if (typeof req === "string") {
        req = { url: req };
      }

      const iterator = intercepts[Symbol.iterator]();

      function send(req: HTTPRequest): Promise<HTTPResponse> {
        const { value, done } = iterator.next();
        if (!done) {
          const [method, filter, intercept] = value as Intercept;
          if (method !== f || !filter(req.url)) return send(req);
          return intercept(req, send);
        }
        return original(req, args[1]);
      }

      return send(req);
    }),
  );

  unpatchHttpHandlers = () => patches.forEach((p) => p());
}

type FilterFn = (url: string) => boolean;
type InterceptFn = (
  req: HTTPRequest,
  send: (req: HTTPRequest | undefined) => Promise<HTTPResponse>,
) => Promise<HTTPResponse>;
type Intercept = [string, FilterFn, InterceptFn];

const intercepts: Intercept[] = [];

export function intercept(method: string, filter: FilterFn, fun: InterceptFn) {
  patchHttpHandlers();

  const pair: Intercept = [method, filter, fun];
  intercepts.push(pair);
  return () => void intercepts.splice(intercepts.indexOf(pair), 1);
}
