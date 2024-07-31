import type { Command } from "./index.js";

import { createServer } from "http";
import { WebSocketServer } from "ws";
import { resolve } from "path";
import { mkdtemp, rm, readFile } from "fs/promises";
import { tmpdir } from "os";
import { watch } from "chokidar";
import { buildPlugin } from "../builder.js";
import { hrtime } from "process";
import { loadNearestCfgOrDefault, loadCfg, LuneCfg } from "../config.js";

const mktempdir = () => mkdtemp(resolve(tmpdir(), "lune-"));

let current: { manifest: any; js: string };

const broadcastList = new Set<() => Promise<void>>();
function startWs() {
  const wsServer = new WebSocketServer({ port: 1211 });
  wsServer.on("connection", (sockets) => {
    const broadcast = () =>
      new Promise<void>((res, rej) => {
        sockets.send(JSON.stringify({ TYPE: "update" }), (err) => {
          if (err) rej(err);
          else res();
        });
      });

    broadcastList.add(broadcast);

    sockets.on("close", () => {
      broadcastList.delete(broadcast);
      //console.log("shelter disconnected");
    });

    // initial broadcast
    broadcast();

    //console.log("new shelter instance tethered");
  });
}

function startHttp() {
  const server = createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    // these two not necessary but w/e
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (current) {
      res.statusCode = 200;
      res.end(JSON.stringify(current));
    } else {
      res.statusCode = 500;
      res.end();
    }
  });

  server.listen(1112, "127.0.0.1", () =>
    console.log(`lune dev up and running!
Under the Developer Options header in shelter's settings, enable "Lune Dev Mode".`),
  );

  //await new Promise(res => server.on("close", res));
}

async function rebuildPlugin(cfg: LuneCfg, dir: string) {
  const outDir = await mktempdir();

  const timeBefore = hrtime.bigint();

  await buildPlugin(dir, outDir, cfg, false);

  const timeAfter = hrtime.bigint();

  current = {
    js: (await readFile(resolve(outDir, "plugin.js"))).toString(),
    manifest: JSON.parse((await readFile(resolve(outDir, "plugin.json"))).toString()),
  };

  await rm(outDir, { recursive: true });

  console.log(`Rebuilt plugin; took ${(timeAfter - timeBefore) / 1000000n}ms`);
}

export default {
  helpText: `lune dev: Develop a plugin with hot reloading in the current directory

lune dev <path>: Develop a plugin with hot reloading in the given path

Options:
  --cfg: Specifies the path to a lune cfg file (default: nearest lune.config.js to the plugin)`,
  argSchema: {
    cfg: "str",
  },
  async exec(args) {
    const dir = args[0] ?? process.cwd();

    const cfg = (await loadCfg(args.cfg as string)) ?? (await loadNearestCfgOrDefault(dir));

    try {
      await rebuildPlugin(cfg, dir);
    } catch (e) {
      throw new Error(`cannot start dev: ${e.message}`);
    }

    startWs();
    startHttp();

    watch(dir, { ignoreInitial: true }).on("all", async () => {
      try {
        await rebuildPlugin(cfg, dir);
        await Promise.all([...broadcastList].map((broadcaster) => broadcaster()));
      } catch (e) {
        console.error(`rebuild failed: ${e.message}`);
      }
    });
  },
} as Command;
