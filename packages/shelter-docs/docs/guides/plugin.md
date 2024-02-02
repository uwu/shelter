# shelter docs: Getting started guide

This guide will walk you through getting started making a shelter plugin from scratch.

shelter is a client mod that avoids touching Discord's internals as much as possible, instead focusing on modifying the document directly, and using Discord's [Flux](https://facebookarchive.github.io/flux/) storage.

This guide assumes that you already know some level of Javascript, and have a JS development environment set up (node + a package manager of your choice (npm), a code editor, git, etc.)

## 1) Setting up the dev tool

While shelter plugins can be written by hand, if that is your preference, it is easier to use a development tool to bundle your files, let you use JSX, bundle dependencies, etc.

The `lune` tool provides a:

- plugin build system
- new plugin scaffold
- dev server with hot reload
- monorepo build tool

(see [the lune docs](../lune/README.md) for more info)

You may install it globally with your package manager of choice:

```sh
npm i -g @uwu/lune
pnpm i -g @uwu/lune
yarn global add @uwu/lune
```

Then invoke as `lune` from the command line.

You *may* skip this step if you install it as a dev dependency in your repository (like the template does), however due to [an ongoing issue with pnpm](https://github.com/pnpm/pnpm/issues/5068), this can be less useful.

## 2) Setting up your plugin repository

Either create a repository from the [template](https://github.com/uwu/shelter-template) on GitHub, or create it from the command line with

```sh
npx degit uwu/shelter-template my-plugins-repo-name
```

You now have a fresh plugins repo, let's take a look around.

- package.json - pretty standard stuff here, the file that manages your repo's dependencies
- pnpm-workspace.yaml - if you choose to use pnpm, this sets up a [workspace](https://pnpm.io/workspaces) (npm and yarn workspaces are configured in package.json)
- lune.config.js - here is where you configure lune! It is optional, but if you choose to use it, allows you to customise the build behaviour.
- plugins/hello-world - here's your first ever plugin! Let's look at each file indidivually here

## 3) plugins/hello-world

First up, plugin.json, this file contains all the info about your plugin that isn't code, but might be useful to a user, e.g. name, developer, description.

If you open it up you can see places to put this info.

Now, index.jsx. Any file named index.js, index.jsx, index.ts, or index.tsx will be picked up by lune as the main file of your plugin. You should export an `onUnload` hook, and can optionally export an `onLoad` hook and a `settings` component - more on that later.

Also notice that the `shelter` global is available at the top. This contains all of shelter's global APIs, which you can play with in your console, plus special plugin specific APIs. [Read more about this here](reference.md).

## 4) Writing a new plugin

Let's break down writing a show-username plugin, which will show the message author's username in brackets after their nickname, if they have one.

First create a plugin with `lune init`, and open the new index file in your text editor of choice.

So the way we're going to approach this is to modify the document, using information we can find in the react fiber. We will then listen for Flux events to know when we need to update the document again.

First, we'll import some shelter APIs we will need:

```js
const {
	flux: {
		dispatcher,
		stores: {
			GuildMemberStore,
			ChannelStore,
			SelectedChannelStore,
			RelationshipStore,
		},
	},
	util: { getFiber, reactFiberWalker },
	observeDom,
} = shelter;
```

The dispatcher lets us listen for events, the stores give us info we will need, the fiber utils will help us pull information out of the document, and the observer tells us which elements to look for - I'll explain in a minute.

## The flux & observe pattern: flux

The pattern looks a little like this:

```js
function handleDispatch(payload) { }

const triggers = ["MESSAGE_CREATE", "CHANNEL_SELECT", "LOAD_MESSAGES_SUCCESS", "UPDATE_CHANNEL_DIMENSIONS"];

export function onLoad() {
    for (const t of triggers) dispatcher.subscribe(t, handleDispatch);
}

export function onUnload() {
    for (const t of triggers) dispatcher.unsubscribe(t, handleDispatch);
}
```

Each of those trigger types is a kind of flux event that signals to us that we may need to handle newly rendered elements, so when any of them happen, we will receive it in `handleDispatch`.

Note however, that `MESSAGE_CREATE` is a very noisy event type, so let's filter it down a little:

```js
function handleDispatch(payload) {
    // only listen for message_create in the current channel
    if (payload.type === "MESSAGE_CREATE" &&
		payload.channelId !== SelectedChannelStore.getChannelId())
        return;
}
```

Now, the flux events tell us when a change is likely to happen, but they don't tell us that the change has definitely happened, how much, or where. For example `UPDATE_CHANNEL_DIMENSIONS` tells us that the user has scrolled some amount, but not which messages have been rerendered.

## The flux & observe pattern: observing

So now we will use a document observer to see what elements change:

```js
function handleElement(elem) { }

function handleDispatch(payload) {
    // only listen for message_create in the current channel
    if (payload.type === "MESSAGE_CREATE" &&
		payload.channelId !== SelectedChannelStore.getChannelId())
        return;

    const unObserve = observeDom("[id^=message-username-]", (elem) => {
        handleElement(elem);
        unObserve();
    });

    setTimeout(unObserve, 500);
}
```

So! Let's break this down! First of all, we call `observeDom` with a [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors), which tells shelter that we're interested in elements with an `id` beginning with `message-username-`.

When one of these elements is modified, shelter will pass it to the callback, in which we process the element, and then remove the observation.

And just in case a dispatch doesn't cause any modifications to the document, we remove the observation after 500ms to avoid slowly degrading Discord's performance over time.

## Pulling data off of the DOM

Now that we get given elements that need changing every time that they are updated, we can go about actually inserting the usernames into the document - but to do that we need to know what user we're concerned with.

Discord use [React](https://react.dev) as their UI library, and this means there are *three* document trees at work:

- elements ("virtual DOM"), which is the tree Discord's code constructs to describe their UI
- the DOM / the document, which is what we're interacting with, and what the user actually sees
- the fibers, which are used by React internals to help speed up its vdom implementation, and contains pretty much all of the information from the elements with extra detail, including
  - the type of the element (be it nothing, a React built-in element, a DOM element, or a React component)
  - the props passed to that element (the same kind of objects you'll find in Flux stores)
  - the corresponding DOM element
  - the parent, child, and siblings
  - etc.

While the elements tree is a powerful thing to be able to modify, and is how classic client mods worked [before September 2022](https://cumcord.com/an-exercise-in-futility), it is volatile and, since the death of webpack searching, difficult.

The document is the easiest and safest thing to modify, however contains missing information that might be useful to us.

We can't really modify the fiber tree ourselves (or at least, nobody's figured out a way to make it work!), however since it does contain information from the element tree, and we can get into it relatively easily from the document, close(-ish) to where we need to be, it is useful for extracting extra information that didn't make it as far as the document.

This includes full message, channel, guild objects etc, functions that we may want to try calling, strings before processing, etc.

So, let's leave the world of document nodes we can see and drop into the world of the highly detailed fiber tree!:

```js
function handleElement(elem) {
    const f = getFiber(elem);
}
```

And, because its good not to lose sight of the goal, what we are looking for here is the author's username, and if they have a nickname in this server - so we need:

- the author ID
- the channel ID so we can look up the guild ID
  - then we can lookup the nickname
- the message type so we know if we should look for DM nicks or server nicks

and all of this lies in the message object, or behind some data we can get from it.

You may notice, however, that the message object isn't in the props of our fiber - `f.pendingProps.message // undefined`, what gives!

Well, we have the fiber for some element related to the username element, since that is what the dom node is, but the message object lies further up the tree, where the whole message is rendered, so we need to move around the tree to find it.

shelter provides tools to make this easier: the fiber walker, so let's walk our fiber, to find a prop called message, and tell it to go up the tree, not down (thats the `true` prop):

```js
function handleElement(elem) {
    const message = reactFiberWalker(getFiber(elem), "message", true)?.pendingProps?.message;
    if (!message) return;
```

Now, we should have either a message object, or we've somehow missed and walked up the tree forever, hit the top of the tree, and given up.

## Looking up extra data with Flux

Our message object is quite big, but the things we care about look like: `message: { author: { id, username }, channel_id }`.

Now let's look up the channel type and guild ID by asking the Flux store for the information - since we have access to Flux in shelter we can simply grab any information we need right out of the same data stores Discord itself uses:

```js
	const { type, guild_id } = ChannelStore.getChannel(message.channel_id);
```

And now we need to get the nickname - which lies in `RelationshipStore` for DMs, and `GuildMemberStore` for servers, and stop if the user has no nickname:

```js
    // type = 0: Guild, 1: DM
    const nick = type
        ? RelationshipStore.getNickname(message.author.id)
        : GuildMemberStore.getNick(guild_id, message.author.id);

    if (!nick) return;
```

## Endgame

Finally, remember we asked the observer for the element that contains the user's username or nickname display, so this means we can leave fiber land and simply add it onto the relevant document node:

```js
	elem.firstElementChild.textContent += ` (${message.author.username})`;
}
```

And there we go!

## Modification instead of interception

This method of modifying the UI treats our changes as modifications to be done, instead of an interception of Discord rendering their UI.

While that is more robust, and easier to do, it does come with the problem that our changes put React out of sync with the document.

This can cause many issues, but one you may have noticed here is that we get multiple copies of the username sometimes, that's not good! This happens because React doesn't know about our modification, so doesn't reset it, but a change higher up still triggers our observer.

To deal with this, we can add an attribute to the element - whenever React would remove our modification, it would also notice our attribute and remove it, but if it leaves it alone it lets us detect that. We'll use a [`data-` attribute](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset) for this.:

```js
function handleElement(elem) {
    if (elem.dataset.showuname_injected) return;
    elem.dataset.showuname_injected = true;
```

And that is it, but actually this time! You should now see that it works as intended, and you may also notice that your code now looks about the same as [the actual show-username plugin](https://github.com/yellowsink/shelter-plugins/blob/master/plugins/show-username/index.js).

## Finishing up

This is a basic plugin, but it shows you a common pattern used to build shelter plugins, and gives you a taste of the general approach used. If there are more advanced guides available later, they'll be in shelter-docs, but as I write this there aren't.

Feel free to have a look at [what plugin developers are doing in their plugins](https://github.com/search?o=desc&q=shelter+plugins&s=updated&type=Repositories), and try your hand at bigger things.

Another thing you may wanna play with is that you have all of [Solid](https://www.solidjs.com/) at your fingertips to build reactive apps easily, or even just to replace the annoying process of creating DOM structures by hand with `document.createElement` with something like the following:

```jsx
someElement.appendChild(
	<div style={{ margin: "5rem" }}>
        <span>Hi guys</span>
        <button onClick={() => console.log("ping!")}>click here!</button>
    </div>
);
```

And because Solid is reactive, if you use a signal in that UI, then updating the signal will automatically update your injected UI on the document, both making building reactive UIs easy, and making, say, injecting an element now and adding content later really easy!

But enough about Solid, go forth and improve Discord, and hopefully enjoy doing it!

-- Yellowsink