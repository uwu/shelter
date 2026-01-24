# Lune SSG

[Lune](lune) is the all-in-one tool for building shelter plugins.
One of its capabilities is its SSG (static site generator),
which can build you a static website that users will see when visiting your repository's webpage,
or more crucially when pasting a plugin's URL into their browser instead of into shelter.

::: warning
Customising Lune SSG is a topic that becomes relevant at the deployment stage.
You may want to skip this one and come back later,
as the guides following this one have more immediately relevant information for plugin development.
:::

## How do I use it?

To build a webpage for a single plugin, run `lune ssg single` in your plugin directory.
A webpage will be emitted into the `dist` folder.

To build a website for a monorepo full of plugins, run `lune ssg ci` in the root of the monorepo, *after running `lune ci`*.
A full website will be emitted into the `dist` folder, alongside your built plugins.

## How do I customise my website?

The static site generator works with various template files that are combined together at build-time to produce the site.

The interesting data is templated in using [Handlebars](https://handlebarsjs.com), and each template is a handlebars
partial.

You can define whatever extra partials you want, and Lune SSG will automatically find and provide them to Handlebars.

Any partials you provide will override the default ones, and you can provide them per-monorepo and per-plugin.
The index page will only be built using your per-monorepo partials, but the plugins' individual pages will use
your per-monorepo _and_ per-plugin partials.

Custom partials go in the `lune-ssg` folder either in your monorepo root, and/or in the invidiual plugin's folder.

You can also put your own `styles.css` in `lune-ssg`, which will override the default stylesheet.

The three special partials are `layout`, `index_main`, and `index_plugin`. More details below.

You can override the data passed to the template engine in your `lune.config.js` by providing the `ssg` object.

You may find it helpful to consult the [list of default partials](#list-of-default-partials),
for small tweaks to the site,
and you will definitely find it useful to see the [data provided to the templating engine](#template-data-reference).

The default website, to use as a base to copy partials or styles from to modify to your needs can be found
[here](https://github.com/uwu/shelter/tree/main/packages/lune/ssg-defaults).

## Recommended customisations

I recommend you add a lune.config.js with:
```js
import { defineConfig } from "@uwu/lune";

export default defineConfig({
  ssg: { repo_name: "Name Here's Plugins" }
});
```

Otherwise, your plugin site will be generated with the name of the folder as the site name, which is likely to be
something boring like "shelter-plugins".

You may want to have more interesting content on the plugin pages than just the shelter manifest description.
You can easily achieve this by adding the file `shelter-plugins/plugins/my-plugin-name/lune-ssg/description.html`.
The manifest description text can be used via the `{{description}}` expression.

## List of default partials

The default website's list of partials is:

 - `layout`: The root of the site, contains the `<!DOCTYPE html>` and all that crap
 - `scripts`: Script tags to add to the page. Override this one to add your own scripts, and re-import `default_scripts`.
 - `default_scripts`: Scripts tags added to the page in the default website.
    You have no reason to override this, like ever, just override `scripts`.
    This is used to dynamically resolve the leading URL for plugin URLs (https://your.site/shelter-plugins or whatever).
 - `nav`: Content in the navbar at the top of the page
 - `main`: Main content below the nav bar. This partial is special! You should _not_ define it explicitly as it
    will not be picked up if you do that. This is instead aliased to either `main_index` or `main_plugin` depending on
    which kind of page is being built.
 - `main_index`: The main content for the index page. Override this instead of `main`.
 - `main_plugin`: The main content for plugin pages. Override this instead of `main`.
 - `footer`: Website footer - "Built with Lune at [date] on commit [hash]"
 - `pre_index`: Content injected before the plugin list in the default `main_index`.
 - `post_index`: Content injected after the plugin list but before the footer in the default `main_index`.
 - `pre_plugin`: Content injected before the plugin description in the default `main_plugin`.
 - `post_plugin`: Content injected after the plugin link but before the footer in the default `main_plugin`.
 - `plugin_card`: The content generated for each individual plugin in the index listing.
 - `resolved_plugin_url`: A span that will be populated with the absolute URL to your plugin at runtime
    (e.g. https://your.site/shelter-plugins/my-plugin-name). You really don't get a lot out of overriding this,
    I don't suggest you bother.
 - `copy_icon`: A copy to clipboard icon SVG. This feels like a good place to remind you that these partial names are
    not special, you can add as many custom partials as you want to componentise your site. That's what this one is!

Of these, `scripts`, `pre`/`post`-`index`/`plugin`, and `description` are there purely
for you to extend or slightly modify the page, and are not actually used substantially by the default site.

Overriding the rest may require more substantial content, but you can always copy and modify the defaults as a base!

Visually, the default partials look like this:

![](/ssg/index_breakdown.png)

![](/ssg/plugins_breakdown.png)

## Template data reference

The templating engine is passed a data object that is used to populate the site with info.

For all pages, the following info is populated:

```ts
type CommonSsgData = {
  build: {
    time: "2026-01-24 20:49:36",
    version: "1.6.0",
    commit: "30d4289"
  },
  styles: "styles.css",
  repo_name: "shelter-plugins",
  plugin_title: "my-plugin",
  cond_infix_colon: ": ",
  cond_infix_bar: " | ",
  ...luneConfigSsg
}
```

Where `luneConfigSsg` is the `ssg` object from your `lune.config.js`, if it exists.

`styles` is the relative URL to the styles.css file. Depending on if you build using `ssg ci` or `ssg single` and if the
page is the index or a plugin page, this might be `../styles.css`. It is consumed by `layout` in the default site.

`repo_name` is the name of the folder containing your monorepo. When building pages for individual plugins this is an
empty string. [Probably you want to override this](#recommended-customisations).

`plugin_title` is the pretty name of the plugin when building plugin pages, and the empty string when building index.

`cond_infix_colon` and `cond_infix_bar` have the contents `: ` and ` | ` if and only if the SSG is generating a plugin
page in a monorepo. An expression like `{{repo_name}}{{cond_infix_colon}}{{plugin_title}}` will generate
`shelter-plugins: plugin-name` in a monorepo, `plugin-name` in an individual page build, and `shelter-plugins` in an
index page build.

_On the index page only_, there is also:
```ts
type IndexPageSsgData = CommonSsgData & {
  plugins: [
    {
      name: "My Plugin",
      description: "My cool plugin that like does a thing or something",
      author: "My name!"
    }
  ]
}
```

`plugins` is a list of all plugin manifest JSONs (parsed) from the monorepo. You can add extra properties to your
`plugin.json` files and use them here, if you want to add extra properties to the plugin manifest that your custom
templates can use.

_On the plugin page only_, there is also:
```ts
type PluginPageSsgData = CommonSsgData & {
  name: "My Plugin",
  description: "My cool plugin that like does a thing or something",
  author: "My name!"
}
```

The contents of the plugin manifest for the current plugin are available directly in the template.
Additional properties from the manifest are of course also appended here.
