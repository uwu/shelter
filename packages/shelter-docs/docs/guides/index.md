# shelter development guides

The guides are under construction.

I recommend you follow read them in order.

::: info
Found yourself here as a user?
These are the docs for developers.
There is much to be learnt about shelter here, but you probably just want the information in the
[README](https://github.com/uwu/shelter#readme-ov-file).
:::

## Getting Started

Plugins for shelter are written in Javascript, and generally are done so with the help of [Lune](lune).

This section will get you setup to start writing.

First, it is recommended to create a git repository to hold your plugins.
You don't *need* to do this, but the repo template includes everything set up for you,
including configuration to get GitHub Actions to build and publish your plugins automatically for you.

If you are using GitHub, you can go to [uwu/shelter-template](https://github.com/uwu/shelter-template), and click the
"Use this template" button to easily create your repo, then clone it locally to start work.
If you are not, or just prefer to work locally, you can run `npx degit uwu/shelter-template shelter-plugins` to create
your repo.

Install dependencies (Lune, type defs) with `npm i`, then run `npm lune ci`. Congrats! You just built a plugin! (~ish!)

This type of structure with one git repository for all your plugins is called a *monorepo*,
which tends to work out especially neat for the use case of Discord plugins.
If you don't like this model, you can of course use separate repos on an org, but you'll have to make your own CI
scripts etc., and you can't access all your plugins in one big workspace in your IDE.

::: tip
The template is setup out-of-the-box with both npm / Yarn / Bun and pnpm workspaces.
I recommend you use [pnpm](https://pnpm.io), especially if you are new to JS and haven't tried alternative package
mangers yet, I think you'll like it!
:::

Assuming you have shelter running in your Discord client, you should now be ready to jump in with development.
The next page will get you up to speed on how to use Lune, our custom build tool.