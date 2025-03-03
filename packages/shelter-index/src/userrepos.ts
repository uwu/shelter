import { Env } from ".";
type PendingOperation =
  | { type: "add"; repoUrl: string; srcUrl: string; author: string }
  | { type: "editurl"; oldUrl: string; newUrl: string }
  | { type: "editsrc"; repoUrl: string; newUrl: string }
  | { type: "editauthor"; repoUrl: string; newAuthor: string }
  | { type: "delete"; repoUrl: string };

type StoredRepo = {
  srcUrl: string;
  author: string;
};
async function addPending(env: Env, operation: PendingOperation): Promise<string> {
  const payload = JSON.stringify(operation);
  const uuid = crypto.randomUUID();
  await env.PENDING.put(uuid, payload, {
    expirationTtl: 14 * 24 * 60 * 60, // 14 days
  });
  return uuid;
}

async function applyPending(env: Env, uuid: string): Promise<void> {
  const rawPayload = await env.PENDING.get(uuid);
  await env.PENDING.delete(uuid);
  const payload = JSON.parse(rawPayload!) as PendingOperation;
  switch (payload.type) {
    case "add":
      new URL(payload.srcUrl);
      new URL(payload.repoUrl);
      if (typeof payload.author !== "string" || !payload.author) {
        throw new Error("author invalid");
      }
      await env.USERREPOS.put(
        payload.repoUrl,
        JSON.stringify({
          srcUrl: payload.srcUrl,
          author: payload.author,
        } satisfies StoredRepo),
      );
      break;
    case "delete":
      await env.USERREPOS.delete(payload.repoUrl);
      break;
    case "editauthor":
      {
        if (typeof payload.newAuthor !== "string" || !payload.newAuthor) {
          throw new Error("author invalid");
        }
        const existing = (await env.USERREPOS.get(payload.repoUrl, "json")) as StoredRepo;
        existing.author = payload.newAuthor;
        await env.USERREPOS.put(payload.repoUrl, JSON.stringify(existing));
      }
      break;
    case "editsrc":
      {
        new URL(payload.newUrl);
        const existing = (await env.USERREPOS.get(payload.repoUrl, "json")) as StoredRepo;
        existing.srcUrl = payload.newUrl;
        await env.USERREPOS.put(payload.repoUrl, JSON.stringify(existing));
      }
      break;
    case "editurl":
      {
        new URL(payload.newUrl);
        const existing = await env.USERREPOS.get(payload.oldUrl);
        if (!existing) {
          break;
        }
        await env.USERREPOS.delete(payload.oldUrl);
        await env.USERREPOS.put(payload.newUrl, existing);
      }
      break;

    default:
      throw new Error("invalid pending operation type");
  }
}

function checkAuth(env: Env, request: Request) {
  if (request.headers.get("Authorization") !== env.BOT_KEY) {
    throw new Error("Unauthorized");
  }
}
export async function handleAdd(env: Env, request: Request) {
  checkAuth(env, request);
  if (request.method !== "POST") throw new Error("wrong method");
  return await addPending(env, await request.json());
}

export async function handleApply(env: Env, request: Request) {
  checkAuth(env, request);
  if (request.method !== "POST") throw new Error("wrong method");
  await applyPending(env, await request.text());
}
