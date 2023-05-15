import { Hono } from "hono";
import { handleAuthCallback, handleIndex } from "./oauth";
import { App } from "./types";
import { handlePoll } from "./auth_polling";
import { handleDelete, handleDownload, handleUpload } from "./sync";

const app: App = new Hono();

app.get("/", handleIndex);
app.get("/api/oauth", handleAuthCallback);
app.get("/api/poll", handlePoll);

app.get("/api/download", handleDownload);
app.put("/api/upload", handleUpload);
app.delete("/api/delete", handleDelete);

export default app;
