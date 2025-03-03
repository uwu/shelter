import nitroCloudflareBindings from "nitro-cloudflare-dev";

export default defineNitroConfig({
  compatibilityDate: "2025-02-03",
  modules: [nitroCloudflareBindings],
  runtimeConfig: {
    DISCORD_CLIENT_ID: "",
    DISCORD_CLIENT_SECRET: "",
    DISCORD_REDIRECT_URI: "http://localhost:3000/oauth/callback",
  },
  preset: "cloudflare_module",
  experimental: {
    database: true,
  },
});
