// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import shelterLogo from "shelter-assets/png/banner.png";
import shelterIcon from "shelter-assets/png/logo.png";

import UnoCSS from "unocss/astro";

import vue from "@astrojs/vue";

// https://astro.build/config
export default defineConfig({
  integrations: [
    UnoCSS({}),
    starlight({
      logo: {
        src: shelterLogo,
        replacesTitle: true,
      },
      favicon: shelterIcon,
      title: "shelter",
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/uwu/shelter" },
        { icon: "discord", label: "Discord", href: "https://discord.gg/FhHQQrVs7U" },
      ],
      customCss: ["./src/styles/custom.css"],
      sidebar: [
        {
          label: "Install",
          slug: "install",
        },
        {
          label: "Plugins",
          slug: "plugins",
        },
        {
          label: "Dev Guides",
          items: [
            { label: "Getting Started", slug: "guides" },
            { label: "Lune", slug: "guides/lune" },
            { label: "Lune SSG", slug: "guides/lune-ssg" },
            { label: "Your First Plugin", slug: "guides/plugin" },
            { label: "Settings, Storage & UI", slug: "guides/settings" },
            { label: "Patterns", slug: "guides/patterns" },
            { label: "Ideals", slug: "guides/ideals" },
            { label: "Background", slug: "guides/background" },
            { label: "Injector Integration", slug: "guides/injectors" },
            { label: "How Injectors Work", slug: "guides/injection" },
          ],
        },
        {
          label: "API Reference",
          slug: "reference",
        },
        {
          label: "shelter UI",
          slug: "ui",
        },
      ],
    }),
    vue(),
  ],
});
