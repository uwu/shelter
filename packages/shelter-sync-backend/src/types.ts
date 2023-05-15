import { Context, Hono } from "hono";

type Bindings = {
  SYNC_KV: KVNamespace;
  POLL_KV: KVNamespace;
  clientid: string;
  clientsecret: string;
  REDIR_URL: string;
};

export type App = Hono<{ Bindings: Bindings }>;

export type Ctxt = Context<{ Bindings: Bindings }>;
