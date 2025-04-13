import type { EventHandlerRequest, H3Event } from "h3";
import type { User } from "./drizzle";
import { getUser } from "./drizzle";

type EventHandlerWithUser<T extends EventHandlerRequest, D> = (event: H3Event<T>, user: User) => Promise<D>;

export function eventHandlerWithUser<T extends EventHandlerRequest, D>(handler: EventHandlerWithUser<T, D>) {
  return defineEventHandler(async (event) => {
    const authHeader = getHeader(event, "authorization");
    if (!authHeader) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    let token: string;

    try {
      token = atob(authHeader);
    } catch {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const [secret, userId, ...rest] = token.split(":");

    if (!secret || !userId || rest.length > 0) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const user = await getUser(event, userId);

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: "User Not Found" });
    }

    return await handler(event, user);
  });
}
