# Lune

[Lune](https://github.com/uwu/shelter/tree/main/packages/lune) is the custom build tool for shelter plugins.

::: tip
As well as the documentation here, the help for the lune command line interface is built into the tool itself.
Try running `lune build --help` or similar to learn how to use Lune's commands.
:::

## What is lune?

Lune is an all-in-one tool for managing and building plugins for shelter.
It provides a fairly robust and friendly command line tool.

It can create new plugins interactively, build plugins, and build monorepos.
It also has a hot-reload "dev mode", which is useful for plugin development.

It builds your plugins using a choice of esbuild or rolldown, which means builds are lightning quick.

It is totally feasible to write shelter plugins by hand, and nothing stops you from doing so, but Lune generally makes
the whole experience much more streamlined and comfortable.

## Getting up to speed with monorepos

A monorepo is a project structure where you place all the components of your software into a single repository.
This applies to shelter plugins by using one repo to contain the source code of multiple plugins.

The shelter developers strongly encourage use of monorepos, and the template gives you one by default.

Lune natively supports monorepos via the `ci` command which will all of your plugins all at once, automatically.

All plugins in a monorepo share a single dependency lock file, and will install faster.
To take advantage of this you can use a supported package manager:
 - [pnpm](https://pnpm.io) (recommended) - no extra setup is needed, `pnpm i` just works.
 - [Yarn](https://yarnpkg.com) - you should probably run `yarn set version stable` inside your monorepo.
 - [npm (workspaces)](https://docs.npmjs.com/cli/v7/using-npm/workspaces) - no special setup, `npm i` just works.

## Styling and Sass

You can import `css` files in your code, and the default export will be their content as a string, ready to inject.

Lune supports [Sass and SCSS](https://sass-lang.com) out-of-the-box, and will compile them to CSS at build time.

Generally you would use [`shelter.ui.injectCss`](/ui#injectcss) to inject this onto the page

Example:
```js
import styles from "./styles.css";
import sassStyles from "./moreStyles.sass";
import scssStyles from "./yetMore.scss";

const remove = shelter.ui.injectCss(styles);

console.log(styles);
// ".my-button { color: red; }" etc.
```

### CSS Modules

Lune optionally supports [CSS Modules](https://css-tricks.com/css-modules-part-1-need/).

To enable it, you just turn it on in the [configuration file](#configuring-lune).

This has two upshots: one, your classes will not conflict with anything else,
two, your CSS automatically injects when you import it and uninjects on unload without any other setup.

You should then change your imports:
```js
// from
import css from "./styles.css";
// to
import classes from "./styles.css";
```

When your CSS is compiled, it will have its classes prefixed with a random string to prevent conflicts.
The map of original class names to randomized class names is given in the `classes` object:
```css
/* styles.css */
.btn { margin: 1rem; }
```
```js
/* plugin JS */
import classes from "./styles.css";
// .btn_8gljn_1 { margin: 1rem; } is injected onto the page at plugin load automatically.
classes == { btn: 'btn_8gljn_1' }
```

## Configuring Lune

Lune is configured using either a `lune.config.js` or `lune.config.json` file.
If a JS file, it should be an ES Module and should `export default` an object.

All options, and the file itself, are not required.

In order, Lune will search the following places for this file:
 - The file path passed directly with `--cfg`, if any
 - Within the folder passed by the user to the relevant command, if any
 - Within the current working directory

### `builder: "esbuild" | "rolldown"`

Choose between [esbuild](https://esbuild.github.io/) and [Rolldown](https://rolldown.rs/) for bundling.

Rolldown is available since Lune 1.5.0.

This setting defaults to Rolldown since Lune 1.5.1, and esbuild before then.

### `minify: boolean`

By default false, when this is on plugins will be compressed for size.
Makes debugging harder, but lune dev by default does not anyway.

### `cssModules: boolean | "legacy"`

Enabling this turns on [CSS Modules](#css-modules). By default this is `false`.

When set to legacy (or just true pre-`1.4.0`), instead of automatically injecting and uninjecting CSS for you,
it will export the css and classes, like:
```js
import { css, classes } from "./styles.css";
```

### (esbuild only) `prePlugins: Plugin[]`

This can only be set from a JS config file.
This is a list of [esbuild](https://esbuild.github.io) plugins to run before Lune's transforms.

### (esbuild only) `postPlugins: Plugin[]`

As above, after Lune's transforms.

### (Rolldown only) `input: InputOptions`

Extra Rolldown [input options](https://rollupjs.org/javascript-api/#inputoptions-object) to pass.

### (Rolldown only) `output: OutputOptions`

Extra Rolldown [output options](https://rollupjs.org/javascript-api/#outputoptions-object) to pass.