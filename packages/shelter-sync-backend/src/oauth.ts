import { Ctxt } from "./types";
import { writeState } from "./auth_polling";

const generateTokenString = (values: any) => btoa(JSON.stringify(values));

export function handleIndex(c: Ctxt) {
  const params = new URLSearchParams({
    client_id: c.env.clientid,
    redirect_uri: c.env.REDIR_URL,
    response_type: "code",
    scope: "identify",
    prompt: "none",
    state: c.req.query("state")!,
  });

  return c.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
}

export async function handleAuthCallback(c: Ctxt) {
  const code = c.req.query("code");
  if (!code) return c.newResponse(null, 401);

  const state = c.req.query("state")!;
  const params = new URLSearchParams({
    client_id: c.env.clientid,
    client_secret: c.env.clientsecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: c.env.REDIR_URL,
    state,
  });

  const res = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  }).then((r) => r.json());

  const tokStr = generateTokenString(res);
  await writeState(c.env.POLL_KV, state, tokStr);

  // TODO: UI
  return c.text("Your token is!: " + tokStr);
}

export async function handleRefresh(c: Ctxt) {
  const res = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: c.env.clientid,
      client_secret: c.env.clientsecret,
      grant_type: "refresh_token",
      refresh_token: c.req.query("tok")!,
    }).toString(),
  });

  if (!res.ok) return c.newResponse(await res.text(), res.status as any);

  return c.text(generateTokenString(await res.json()));
}
