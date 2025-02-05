export default defineEventHandler(() => {
  const { DISCORD_REDIRECT_URI, DISCORD_CLIENT_ID } = useRuntimeConfig();
  return {
    redirect_uri: DISCORD_REDIRECT_URI,
    client_id: DISCORD_CLIENT_ID,
  };
});
