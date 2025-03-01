import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { DataExport } from "~/utils/lib";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().unique(),
  secret: text("secret").notNull(),
  settings: text("settings", { mode: "json" }).$type<DataExport>(),
  lastUpdated: text("last_updated"),
});
