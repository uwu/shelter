import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().unique(),
  secret: text("secret").notNull(),
  settings: text("settings").notNull(),
  lastUpdated: integer("last_updated", { mode: "timestamp" }).notNull(),
});
