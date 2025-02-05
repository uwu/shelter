import type { drizzle } from "drizzle-orm/libsql";
export { sql, eq, and, or } from "drizzle-orm";

import * as schema from "../database/schema";

export const tables = schema;

export function useDrizzle() {
  // @ts-ignore: type not inherited
  return useNitroApp().$drizzle as ReturnType<typeof drizzle<typeof schema>>;
}

export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;

export async function getUser(id: string) {
  return await useDrizzle()
    .select()
    .from(tables.users)
    .where(eq(tables.users.id, id))
    .then((res) => res[0]);
}
