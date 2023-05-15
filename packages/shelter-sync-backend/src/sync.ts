import { Ctxt } from "./types";

async function uidFromAuth(auth: undefined | string) {
  const token = auth?.split(" ")?.[1];
  if (!token) return;

  const res = await fetch("https://discord.com/api/v6/users/@me", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  if (!res.ok) return;
  return ((await res.json()) as any)?.id as string;
}

export async function handleDownload(c: Ctxt) {
  const uid = await uidFromAuth(c.req.header("Authorization"));
  if (!uid) return c.newResponse(null, 401);

  const found = await c.env.SYNC_KV.get(uid);
  return found ? c.text(found) : c.notFound();
}

export async function handleUpload(c: Ctxt) {
  const uid = await uidFromAuth(c.req.header("Authorization"));
  if (!uid) return c.newResponse(null, 401);

  const bodyTxt = await c.req.text();

  try {
    JSON.parse(bodyTxt);
  } catch (e) {
    return c.newResponse(e + "", 400);
  }

  await c.env.SYNC_KV.put(uid, bodyTxt);

  return c.newResponse(null, 201);
}

export async function handleDelete(c: Ctxt) {
  const uid = await uidFromAuth(c.req.header("Authorization"));
  if (!uid) return c.newResponse(null, 401);

  await c.env.SYNC_KV.delete(uid);
  return c.newResponse(null, 204);
}
