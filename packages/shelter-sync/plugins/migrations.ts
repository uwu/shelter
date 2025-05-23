import { defineNitroPlugin } from "nitropack/dist/runtime/plugin";
import { applyMigrations } from "../utils/migrations";

export default defineNitroPlugin((nitroApp) => {
  if (!import.meta.dev) return;

  nitroApp.hooks.hookOnce("request", async (event) => {
    // Only run migrations once on first request
    if (!global.__migrationsApplied) {
      try {
        await applyMigrations(event);
        global.__migrationsApplied = true;
      } catch (error) {
        console.error("Failed to apply migrations:", error);
      }
    }
  });
});
