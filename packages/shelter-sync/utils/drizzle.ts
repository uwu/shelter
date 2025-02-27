import { drizzle } from "drizzle-orm/libsql";
import { and, eq, or, sql } from "drizzle-orm";

import * as tables from "../database/schema";

export { sql, eq, and, or, tables };

export function useDrizzle() {
  // @ts-ignore: type not inherited
  return useNitroApp().$drizzle as ReturnType<typeof drizzle<typeof tables>>;
}

export type User = typeof tables.users.$inferSelect;
export type NewUser = typeof tables.users.$inferInsert;

export async function getUser(userId: string) {
  return await useDrizzle()
    .select()
    .from(tables.users)
    .where(eq(tables.users.id, userId))
    .then((res) => res[0]);
}
