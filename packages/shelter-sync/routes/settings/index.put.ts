import { inflateSync as inflate } from "fflate";

export default eventHandlerWithUser(async (event, user) => {
  if (event.headers.get("content-type") !== "application/octet-stream") {
    throw createError({
      statusCode: 400,
      statusMessage: "Content-Type must be application/octet-stream",
    });
  }
  const body = await readRawBody(event, false);

  if (!body) {
    throw createError({
      statusCode: 400,
      statusMessage: "No body provided",
    });
  }

  const now = Date.now();

  try {
    const decompressed = inflate(new Uint8Array(body));
    const dataString = new TextDecoder().decode(decompressed);

    await useDrizzle()
      .update(tables.users)
      .set({
        settings: dataString,
        lastUpdated: new Date(now),
      })
      .where(eq(tables.users.id, user.id));

    return {
      message: "User settings updated successfully",
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
