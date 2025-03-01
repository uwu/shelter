import { drizzle } from "drizzle-orm/d1";
import type { H3Event } from "h3";
import * as schema from "../database/schema";
import { eq } from "drizzle-orm";

export const tables = schema;

export function useDrizzle(event: H3Event) {
  return drizzle(event.context.cloudflare.env.DB as unknown as D1Database, { schema: tables }) as ReturnType<
    typeof drizzle<typeof tables>
  >;
}

export type User = typeof tables.users.$inferSelect;
export type NewUser = typeof tables.users.$inferInsert;

export async function getUser(event: H3Event, userId: string) {
  return await useDrizzle(event)
    .select()
    .from(tables.users)
    .where(eq(tables.users.id, userId))
    .then((res) => res[0]);
}

export async function createUser(event: H3Event, user: NewUser) {
  return await useDrizzle(event)
    .insert(tables.users)
    .values(user)
    .onConflictDoUpdate({
      target: [tables.users.id],
      set: user,
    });
}

export async function updateUser(event: H3Event, user: User) {
  return await useDrizzle(event).update(tables.users).set(user).where(eq(tables.users.id, user.id));
}

export async function deleteUser(event: H3Event, userId: string) {
  return await useDrizzle(event).delete(tables.users).where(eq(tables.users.id, userId));
}
