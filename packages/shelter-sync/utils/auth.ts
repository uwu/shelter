import type { EventHandlerRequest, H3Event } from "h3";
import type { User } from "./drizzle";

type EventHandlerWithUser<T extends EventHandlerRequest, D> = (event: H3Event<T>, user: User) => Promise<D>;

export function eventHandlerWithUser<T extends EventHandlerRequest, D>(handler: EventHandlerWithUser<T, D>) {
  return defineEventHandler(async (event) => {
    // Get user id from params
    const userId = event.context.params?.userId;
    if (!userId) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const user = await getUser(userId);
    return await handler(event, user);
  });
}
