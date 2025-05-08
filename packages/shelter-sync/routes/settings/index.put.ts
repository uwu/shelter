import { updateUser } from "~/utils/drizzle";
import { eventHandlerWithUser } from "~/utils/auth";
import type { DataExport } from "~/utils/lib";

export default eventHandlerWithUser(async (event, user) => {
  const contentType = event.headers.get("Content-Type");

  if (contentType !== "application/json") {
    throw createError({
      statusCode: 400,
      statusMessage: "Content-Type must be application/json",
    });
  }

  let data: DataExport;

  try {
    data = await readBody<DataExport>(event);
    console.log(data);
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: "Failed to parse request body",
    });
  }

  const size = JSON.stringify(data).length > 1024 * 1024;
  console.log("exceeds size", size);

  // Cap the size at 1MB
  if (size) {
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
