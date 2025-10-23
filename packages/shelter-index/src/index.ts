import { RepositoryData, fetchSources } from "./github";
import Fuse from "fuse.js";
import { handleAdd } from "./userrepos";

export interface Env {
  GH_TOKEN: string;
  BOT_KEY: string;
  REPO: KVNamespace;
  OVERRIDES: KVNamespace;
  USERREPOS: KVNamespace;
  PENDING: KVNamespace;
}

const handler: ExportedHandler<Env> = {
  async scheduled(event, env, ctx) {
    const data = await fetchSources(env);
    await env.REPO.put("data", JSON.stringify(data));
    await env.REPO.delete("index");
  },
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let response = await caches.default.match(request);
    if (response) return response;

    if (url.pathname === "/addpending") {
      response = new Response(await handleAdd(env, request));
    } else if (url.pathname === "/addpending") {
      await handleAdd(env, request);
      response = new Response();
    } else if (url.pathname === "/data") {
      const result = await env.REPO.get<RepositoryData[]>("data", "json");
      response = Response.json(result, {
        headers: {
          "Cache-Control": "public, max-age=300",
        },
      });
    } else if (url.pathname === "/search") {
      const query = url.searchParams.get("q");
      if (!query) {
        return new Response(null, { status: 400 });
      }

      const [data, index] = await Promise.all([
        await env.REPO.get<RepositoryData[]>("data", "json"),
        await env.REPO.get("index", "json"),
      ]);

      const fuse = new Fuse(
        data!.flatMap((r) => r.plugins),
        {
          keys: ["name", "description"],
          threshold: 0.5,
          useExtendedSearch: true,
        },
        index ? Fuse.parseIndex(index) : undefined,
      );

      if (!index) {
        await env.REPO.put("index", JSON.stringify(fuse.getIndex()));
      }

      const result = fuse.search(query, { limit: 5 }).map((i) => i.item);

      response = Response.json(result, {
        headers: {
          "Cache-Control": "public, max-age=600",
        },
      });
    }

    if (!response) {
      return new Response(null, { status: 404 });
    }

    response.headers.set("Access-Control-Allow-Origin", "*");

    await caches.default.put(request, response.clone());
    return response;
  },
};

export default handler;
