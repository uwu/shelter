export default defineEventHandler((event) => {
  handleCors(event, {
    origin: ["https://discord.com", "https://ptb.discord.com", "https://canary.discord.com"],
    exposeHeaders: ["ETag"],
  });

  return () => {
    /** no-op */
  };
});
