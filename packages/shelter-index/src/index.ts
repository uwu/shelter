import { RepositoryData, fetchSources } from "./github";
import Fuse from "fuse.js";

export interface Env {
  GH_TOKEN: string;
  REPO: KVNamespace;
}

const handler: ExportedHandler<Env> = {
  async scheduled(event, env, ctx) {
    const data = await fetchSources(env.GH_TOKEN);
    await env.REPO.put("data", JSON.stringify(data));
    await env.REPO.delete("index");
  },
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let response = await caches.default.match(request);
    if (response) return response;

    if (url.pathname === "/data") {
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

    await caches.default.put(request, response.clone());
    return response;
  },
};

export default handler;
