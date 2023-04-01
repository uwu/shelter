# Lune

The build tool for shelter.

## Quick start

1. Clone the repo template (`npx degit uwu/shelter-template shelter-plugins` will do it)
2. `npm i` (or your package manager of choice)
3. Either edit the hello world plugin, or navigate to `plugins` and run `lune init` to make a new plugin
4. Run `lune ci` from the root of the plugin to build them!

Lune is intended to work hand-in-hand with the repo template - you absolutely can use it separately, it'll work fine,
but the repo template has Lune setup already,
[pnpm](https://pnpm.io/workspaces) and
[npm](https://docs.npmjs.com/cli/v7/using-npm/workspaces/) monorepos to start you off, and a suitable tsconfig.

## What is Lune?

Lune is an all-in-one tool for managing and building plugins for shelter.

It replaces a set of tools taped together with node and bash with a (fairly) robust and friendly command line tool.

It can create new plugins interactively, build plugins, and build monorepos.
In the future it will have a dev mode of sorts, but this is work in progress (watch this space!)

It currently is based on esbuild, which means builds are very fast, at the expense of ecosystem size and (maybe?)
output size.

## Getting up to speed with _monorepos_

A monorepo is a project structuring pattern in which you put all the components of your software in a single repository.
This applies to shelter plugins by using one repository to contain the source code for multiple plugins.

The shelter developers encourage use of monorepos for shelter plugin development,
and the template repo will give you a monorepo by default.

Lune supports monorepos natively via the `ci` command - instead of building each plugin separately in a script,
just put all of your plugins in `./plugins/plugin-1`, `./plugins/plugin-2`, etc., and Lune will build them all.

You can configure a different subdirectory than `plugins` - see _Configuring Lune_.

All plugins in a monorepo share a single dependency lock file, and your installs should be faster.
To take advantage of this, you can use a supported package manager such as
[pnpm](https://pnpm.io/) (recommended), [yarn](https://yarnpkg.com/),
or [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces).

## Styling, Sass and CSS Modules

Lune supports [Sass](https://sass-lang.com/) and SCSS out of the box, and will compile them to CSS at build time.

Simply `import css from "./styles.css"`, `styles.sass`, `styles.scss`, and inject them with `shelter.ui.injectCss`.

Lune also optionally supports [CSS Modules](https://css-tricks.com/css-modules-part-1-need/).

To use CSS Modules, you simply need to set `cssModules` in the config file - see _Configuring Lune_.

Then, you need to change your import from `import css from "./mystyles.scss"` to `import {css, classes} from "./mystyles.scss"`.
This _is_ an unorthodox way of doing CSS Modules, and it means existing IDE support won't work
(due to this, this is under review), but other tools generally have another way to inject the css string!

The classes object contains the real classnames for you to use - an example speaks volumes!:

```css
/* no css modules */
.button {
  margin: 1rem;
}
```

```js
// no css modules
import css from "./styles.css";
// make sure to call uninj() in your onUnload handler
const uninj = shelter.ui.injectCss(css);

export const MyComponent = () => <button class="button" />;
```

```css
/* with css modules */
.button {
  margin: 1rem;
}
```

```js
// with css modules
import { css, classes } from "./styles.css";
// make sure to call uninj() in your onUnload handler
const uninj = shelter.ui.injectCss(css);

export const MyComponent = () => <button class={classes.button} />;
```

```css
/* css modules compiled css */
.button_8gljn_1 {
  margin: 1rem;
}
```

## Configuring Lune

Lune is configured with a `lune.config.js` file in the root of your repo.
Both the `lune build` and `lune ci` commands will expect it to be in the working path unless passed otherwise.

It is an ES module JS file which should `export default` an object containing the options. All options are optional.

The options are:

- `repoSubDir: string` - the subdir to use for monorepos - see above for details, by default `"plugins"`
- `cssModules: boolean` - if CSS Modules are enabled, by default `false`
- `prePlugins: Plugin[]` - [esbuild](https://esbuild.github.io/) plugins to run before Lune's transforms
- `postPlugins: Plugin[]` - esbuild plugins to run after Lune's transforms
