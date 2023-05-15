import { Hono } from "hono";

const app = new Hono<{
  Bindings: {
    SYNC_KV: KVNamespace;
    clientid: string;
    clientsecret: string;
    REDIR_URL: string;
  };
}>();

app.get("/api/oauth", async (c) => {
  const code = c.req.query("code");
  if (!code) return c.newResponse(null, 401);

  const params = new URLSearchParams({
    client_id: c.env.clientid,
    client_secret: c.env.clientsecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: c.env.REDIR_URL,
  });

  const res = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  }).then((r) => r.json());

  return c.json(res);
});

app.get("/", (c) => {
  const params = new URLSearchParams({
    client_id: c.env.clientid,
    redirect_uri: c.env.REDIR_URL,
    response_type: "code",
    scope: "identify",
    prompt: "none",
  });
  return c.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

export default app;
