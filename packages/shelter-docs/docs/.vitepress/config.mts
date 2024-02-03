import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "shelter docs",
  description: "Documentation for the shelter client mod",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "https://github.com/uwu/shelter/raw/main/packages/shelter-assets/svg/banner.svg",
    siteTitle: "docs",
    nav: [
      { text: "Home", link: "/" },
      { text: "Plugins", link: "/plugins" },
      { text: "Guides", link: "/guides/" },
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
            { text: "Patterns", link: "/guides/patterns" },
            { text: "Ideals", link: "/guides/ideals" },
            { text: "Background", link: "/guides/background" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/uwu/shelter" },
      { icon: "discord", link: "https://discord.gg/FhHQQrVs7U" },
    ],
  },
});
