export default defineEventHandler(async (event) => {
  const { code } = getQuery(event);

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing code",
    });
  }

  const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI } = useRuntimeConfig();

  const formData = new FormData();
  formData.append("client_id", DISCORD_CLIENT_ID);
  formData.append("client_secret", DISCORD_CLIENT_SECRET);
  formData.append("grant_type", "authorization_code");
  formData.append("code", code.toString());
  formData.append("redirect_uri", DISCORD_REDIRECT_URI);
  formData.append("scope", "identify");

  const response = await $fetch<{ access_token: string }>("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: formData,
  });

  if (!response.access_token) {
    console.error(response);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to get access token",
    });
  }

  const { access_token } = response;

  const userResponse = await $fetch<{ id: string }>("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!userResponse.id) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to get user data",
    });
  }

  const { id: userId } = userResponse;

  // Get secret for the user from database
  const user = await useDrizzle().query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  });

  let secret = user?.secret;

  if (!secret) {
    secret = generateSecret();

    await useDrizzle()
      .update(tables.users)
      .set({
        secret: secret,
      })
      .where(eq(tables.users.id, userId));
  }

  return {
    secret,
  };
});
