import type { Command } from ".";

import { createServer } from "http";
// TODO: this library straight up does not work in ESM, how fun
import WebSocket from "ws";

let current: { manifest: any; js: string };

const broadcastList = new Set<() => Promise<void>>();

export default {
  helpText: `lune dev

Coming soon.`,
  argSchema: {},
  exec(_) {
    const wsServer = new WebSocket.Server({ port: 1211 });
    wsServer.on("connection", (sockets) => {
      const broadcast = () =>
        new Promise<void>((res, rej) => {
          sockets.send(JSON.stringify({ TYPE: "update" }), (err) => {
            if (err) rej(err);
            else res();
          });
        });

      broadcastList.add(broadcast);

      sockets.on("close", () => broadcastList.delete(broadcast));

      // if current has been built, send it now, else wait for it to be built
      if (current) broadcast();
    });

    const server = createServer((req, res) => {
      if (current) {
        res.statusCode = 200;
        res.end(JSON.stringify(current));
      } else {
        res.statusCode = 500;
      }
    });

    server.listen(1112);
  },
} as Command;
