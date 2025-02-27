export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    handleCors(event, {
      origin: ["https://discord.com", "https://ptb.discord.com", "https://canary.discord.com"],
      exposeHeaders: ["ETag"],
      methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
      credentials: true,
    });

    // End the response early for OPTIONS requests
    if (event.node.req.method === "OPTIONS") {
      event.node.res.statusCode = 204;
      event.node.res.end();
      return;
    }
  });
});
