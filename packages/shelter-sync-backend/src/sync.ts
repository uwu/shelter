import { Ctxt } from "./types";
import { delete_, upload } from "./storage";

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

  const err = await upload(c.env.SYNC_KV, uid, c.req.query("client"), bodyTxt);

  return err ? c.newResponse(err.message, 400) : c.newResponse(null, 201);
}

export async function handleDelete(c: Ctxt) {
  const uid = await uidFromAuth(c.req.header("Authorization"));
  if (!uid) return c.newResponse(null, 401);

  const err = await delete_(c.env.SYNC_KV, uid, c.req.query("client"), !!c.req.query("all"));

  return err ? c.newResponse(err.message, 400) : c.newResponse(null, 204);
}
