import { Ctxt } from "./types";

export async function writeState(ns: KVNamespace, state: undefined | string, tokenstr: string) {
  if (!state || state === "undefined") return;

  // if one exists, this could give the wrong person access to your account
  // it would be a very unlikely timing attack but yeah just *not writing the token* is safer
  if (await ns.get(state)) return;

  await ns.put(state, tokenstr, {
    expirationTtl: 5 * 60, // 5 mins
  });
}

export async function handlePoll(c: Ctxt) {
  const state = c.req.query("state");
  if (!state) return c.newResponse(null, 400);

  const tok = await c.env.POLL_KV.get(state);
  if (!tok) return c.notFound();

  await c.env.POLL_KV.delete(state);

  return c.text(tok);
}
