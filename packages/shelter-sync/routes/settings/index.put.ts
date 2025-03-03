import { updateUser } from "~/utils/drizzle";
import { eventHandlerWithUser } from "~/utils/auth";
import type { DataExport } from "~/utils/lib";

export default eventHandlerWithUser(async (event, user) => {
  if (event.headers.get("content-type") !== "application/json") {
    throw createError({
      statusCode: 400,
      statusMessage: "Content-Type must be application/json",
    });
  }

  const data = await readBody<DataExport>(event);

  if (!data) {
    throw createError({
      statusCode: 400,
      statusMessage: "No body provided",
    });
  }

  // Cap the size at 1MB
  if (JSON.stringify(data).length > 1024 * 1024) {
    throw createError({
      statusCode: 400,
      statusMessage: "Body is too large",
    });
  }

  const now = Date.now();

  try {
    await updateUser(event, {
      id: user.id,
      secret: user.secret,
      settings: data,
      lastUpdated: `${now}`,
    });

    return {
      message: "User settings updated successfully",
      lastUpdated: now,
    };
  } catch (error) {
    // Handle error
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update user settings",
    });
  }
});
