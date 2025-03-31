import nitroCloudflareBindings from "nitro-cloudflare-dev";

export default defineNitroConfig({
  compatibilityDate: "2025-02-03",
  modules: [nitroCloudflareBindings],
  runtimeConfig: {
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    DISCORD_REDIRECT_URI: process.env.DISCORD_REDIRECT_URI,
  },
  preset: "cloudflare_module",
  experimental: {
    database: true,
  },
});
