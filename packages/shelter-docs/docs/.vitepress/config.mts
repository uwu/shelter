import { defineConfig } from "vitepress";
import { fileURLToPath } from "node:url";
import UnoCSS from "unocss/vite";
import Solid from "vite-plugin-solid";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "shelter",
  description: "an attempt to prepare for the worst",
  vite: {
    plugins: [UnoCSS(fileURLToPath(new URL("./unocss.config.ts", import.meta.url))), Solid()],
    optimizeDeps: { exclude: ["@vueuse/integrations"] },
  },
  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "https://github.com/uwu/shelter/raw/main/packages/shelter-assets/svg/banner.svg",
    siteTitle: "",
    search: { provider: "local" },
    nav: [
      { text: "Install", link: "/install" },
      { text: "Plugins", link: "/plugins" },
      { text: "Dev Guides", link: "/guides/" },
      { text: "API Reference", link: "/reference" },
      { text: "shelter UI", link: "/ui" },
    ],

    sidebar: {
      "/guides/": [
        {
          text: "Guides",
          items: [
            { text: "Getting Started", link: "/guides/" },
            { text: "Lune", link: "/guides/lune" },
            { text: "Your First Plugin", link: "/guides/plugin" },
            { text: "Settings, Storage & UI", link: "/guides/settings" },
            { text: "Patterns", link: "/guides/patterns" },
            { text: "Ideals", link: "/guides/ideals" },
            { text: "Background", link: "/guides/background" },
            { text: "Injector Integration", link: "/guides/injectors" },
            { text: "How Injectors Work", link: "/guides/injection" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/uwu/shelter" },
      { icon: "discord", link: "https://discord.gg/FhHQQrVs7U" },
    ],
  },
  cleanUrls: true,
});
