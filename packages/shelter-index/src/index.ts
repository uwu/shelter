import { PluginManifest, RepositoryData, fetchPluginMap } from "./github";
import Fuse from "fuse.js";

export interface Env {
  GH_TOKEN: string;
  REPO: KVNamespace;
}

const handler: ExportedHandler<Env> = {
  async scheduled(event, env, ctx) {
    const map = await fetchPluginMap(env.GH_TOKEN);
    // this is probably not ideal usage of KV but oh well i can fix that soon:tm:
    for (const [name, data] of map) {
      await env.REPO.put(name, JSON.stringify(data), {
        expirationTtl: 60 * 60 * 4, // expire key after 4 hours, this filters deleted repositories
      });
    }
  },
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let response = await caches.default.match(request);
    if (response) return response;

    if (url.pathname === "/repo") {
      // ugh, refer to line 11
      const result: RepositoryData[] = [];

      for (const key of await env.REPO.list().then((l) => l.keys)) {
        result.push((await env.REPO.get<RepositoryData>(key.name, "json"))!);
      }

      response = Response.json(result, {
        headers: {
          "Cache-Control": "public, max-age=3600",
        },
      });
    } else if (url.pathname === "/search") {
      const query = url.searchParams.get("q");
      if (!query) {
        return new Response(null, { status: 400 });
      }

      const list: PluginManifest[] = [];
      for (const key of await env.REPO.list().then((l) => l.keys)) {
        const data = (await env.REPO.get<RepositoryData>(key.name, "json"))!;
        list.push(...data.plugins);
      }

      const fuse = new Fuse(list, {
        keys: ["name", "description"],
      });

      const result = fuse.search(query, { limit: 5 }).map((i) => i.item);

      response = Response.json(result, {
        headers: {
          "Cache-Control": "public, max-age=7200",
        },
      });
    }

    if (!response) {
      return new Response(null, { status: 404 });
    }

    await caches.default.put(request, response.clone());
    return response;
  },
};

export default handler;
