export default defineEventHandler((event) => {
  const { DISCORD_REDIRECT_URI, DISCORD_CLIENT_ID } = useRuntimeConfig(event);
  return {
    redirect_uri: DISCORD_REDIRECT_URI,
    client_id: DISCORD_CLIENT_ID,
  };
});
