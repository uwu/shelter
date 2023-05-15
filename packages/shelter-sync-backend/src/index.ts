import { Hono } from "hono";
import { handleAuthCallback, handleIndex } from "./oauth";
import { App } from "./types";
import { handlePoll } from "./auth_polling";

const app: App = new Hono();

app.get("/", handleIndex);
app.get("/api/oauth", handleAuthCallback);
app.get("/api/poll", handlePoll);

export default app;
