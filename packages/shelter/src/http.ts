import { after, instead } from "spitroast";
import { DiscordHTTP, HTTPApi, HTTPRequest, HTTPResponse } from "./types";

const methods = ["get", "post", "put", "patch", "del"];

let resolve: () => void;
export let ready = new Promise<void>((res) => (resolve = res));
export let discordHttp: DiscordHTTP;

const api: HTTPApi = {
  intercept,
  ready,
  get _raw() {
    return discordHttp;
  },
};

for (const fun of methods) {
  api[fun] = (...args: any[]) => {
    if (discordHttp === undefined) throw new Error("HTTP method used before API was ready");
    return discordHttp[fun](...args);
  };
}

export default api;

const unpatch = after("bind", Function.prototype, function (args, res) {
  if (args.length !== 2 || args[0] !== null || args[1] !== "get") return;
  unpatch();
  return function (...args) {
    // I don't know why, but for the first call `this` is Window
    if (this !== window) {
      this.get = res;
      discordHttp = this;
      Object.assign(api, discordHttp);
      resolve();
    }
    return res(...args);
  };
});

export let unpatchHttpHandlers;
function patchHttpHandlers() {
  if (unpatchHttpHandlers) return;
  const patches = methods.map((fun) =>
    instead(fun, discordHttp, async (args, original) => {
      let req = args[0];
      if (typeof req === "string") {
        req = { url: req };
      }

      const iterator = intercepts[Symbol.iterator]();

      function send(req: HTTPRequest): Promise<HTTPResponse> {
        const { value, done } = iterator.next();
        if (!done) {
          const [method, filter, intercept] = value as Intercept;
          if (method.toLowerCase() !== fun || !filter(req.url)) return send(req);

          let called = false;
          function sendOnce(req: HTTPRequest): Promise<HTTPResponse> {
            if (called) throw new Error("You cannot call 'send' more than once.");
            called = true;
            return send(req);
          }

          return intercept(req, sendOnce);
        }
        return original(req, args[1]);
      }

      return send(req);
    }),
  );

  unpatchHttpHandlers = () => patches.forEach((p) => p());
}

type Method = "get" | "post" | "put" | "patch" | "del";
type FilterFn = (url: string) => boolean;
type InterceptFn = (
  req: HTTPRequest,
  send: (req: HTTPRequest | undefined) => Promise<HTTPResponse>,
) => Promise<HTTPResponse>;
type Intercept = [Method, FilterFn, InterceptFn];

const intercepts: Intercept[] = [];

export function intercept(method: Method, filter: string | RegExp | FilterFn, fun: InterceptFn) {
  ready.then(patchHttpHandlers);

  let filterFn: FilterFn;
  if (typeof filter === "string") {
    filterFn = (url) => url === filter;
  } else if (filter instanceof RegExp) {
    filterFn = (url) => url.search(filter) !== -1;
  } else {
    filterFn = filter;
  }

  const pair: Intercept = [method, filterFn, fun];
  intercepts.push(pair);
  return () => {
    const index = intercepts.indexOf(pair);
    if (index !== -1) intercepts.splice(index, 1);
  };
}
