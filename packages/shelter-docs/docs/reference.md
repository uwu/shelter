# shelter API Reference

This document lists all the APIs exposed on `window.shelter`, and how they work.

They are all available on the global, but the `shelter.plugin` API (note: different to `shelter.plugins`) is only available from within a plugin, and contains plugin-specific APIs.

API functions will have their TypeScript signatures listed.

## Top level

### `shelter.observeDom`

```ts
function observeDom(selector: string, cb: (node: DOMNode) => void): {(): void; now(): void}
```

shelter provides a DOM observer, which is an abstraction over [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).
This allows you to efficiently listen for changes to the document.

The returned function can be called to stop this observation. Calling it more than once is fine.

Your callback function will be called once per matched element.

All elements modified in the current batch will cause the observation to fire, even after unobserving.
To instantly stop sending elements to your callback, replace `unobserve()` with `unobserve.now()`.

This is intended behaviour so that you can use unobserve in your callback,
even if you intend to listen for a whole list of elements.

`selector` is a [CSS Selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors).
This selector applies to elements that change, and all of their children.

Generally, you would use this to wait for React to render something you are interested in, after you know its about to.

It is recommended to use a fallback timeout to prevent leaving observations forever.

```ts
// we have reason to expect that a message is going to be rerendered shortly at this point
const unObserve = observeDom("h3 time[id^=message-timestamp]", (el) => {
    unObserve(); // we've found it in this batch of DOM changes, so we can stop looking now!
    doInterestingThings(el);
});
// we expect to see a change in the DOM before a second after now
// and if we don't, this'll prevent a slow buildup of duplicate observations (not nice).
setTimeout(unObserve, 1000);
```

### `shelter.unload`

```ts
function unload(): void
```

Unloads all plugins, and then shelter itself.

No guarantees are made about plugins cleaning themselves up, but all of shelter's changes will be cleaned up, and all function patches will be removed.

## `shelter.flux`

Flux is a state management system used by Discord to handle their client-side state, and it the cornerstone of shelter - everything revolves around Flux.

This is not documentation on Flux itself, but to give a quick rundown!:

- data is kept within *stores*, which expose methods to query them - e.g. get a user by ID.
- When something happens that needs to change the UI, you send a *dispatch*.
- Each dispatch is an object with a *type*, which is a string that chooses which *subscribers* are called to handle the dispatch.
- Stores subscribe to the dispatcher to change their data when a dispatch happens.
- You can listen to dispatches to know when things happen, and quite often mess with or block them to change Discord's behaviour.
- You can use the stores to get direct access to Discord's client-side data storage.

Flux is often combined with `shelter.observeDom` to build the most common pattern for knowing when to modify the app UI.

### `shelter.flux.dispatcher`

The *dispatcher* is the Flux Dispatcher object used by Discord. Discord use a heavily modified version of Flux, but the basics are covered at the Flux docs here: https://github.com/facebookarchive/flux/blob/main/docs/Dispatcher.md

Here is a very basic toy example of using the dispatcher, just to get the idea down:

```ts
function handler(dispatch) {
  console.log("Hello, " + dispatch.name);
}

dispatcher.subscribe("SAY_HI", handler);

dispatcher.dispatch({ type: "SAY_HI", name: "shelter user" }); // Hello, shelter user
dispatcher.dispatch({ type: "SAY_HI", name: "Rin" });          // Hello, Rin

dispatcher.unsubscribe("SAY_HI", handler);
```

### `shelter.flux.stores`

Stores contains all of the Flux stores used by Discord. It is an object with the store names as strings and the stores as values.

If store names collide, the value is an array of stores.

For example:

```ts
shelter.flux.stores.UserStore.getUser("1045796505535135855");
// {
//   id: "1045796505535135855",
//   username: "uwu radio",
//   discriminator: "7529",
//   ...
// }

// repeated store name, such as if its minified
console.log(shelter.flux.stores.m);
// [ m {}, m {} ]
```

::: danger
As these stores contain almost all client-side state within Discord,
there is sensitive data contained within some of them. (email, phone, etc.)
Be VERY careful with your handling of this data, if you choose to use it - remember that [data is radioactive!](https://twitter.com/FiloSottile/status/1162404848073170944)

I know that me writing this will draw it to malicious authors' attention that this is easily possible,
but its worth the note before some dev someone inadvertently posts their own user object or something ;)
:::

### `shelter.flux.storesFlat`

Sometimes, stores collide, it happens.

`flux.stores` deals with this by grouping same-named stores into an array,
which keeps all stores found available.

This is annoying to handle for, and in many cases just using the first store found is fine.
To deal with this case, the read only `flux.storesFlat` object is also exposed.

It will ignore collisions and only expose the first store found by name.

Example is same as above.

### `shelter.flux.awaitStore`

```ts
function awaitStore(name: string, awaitInit = true): Promise<FluxStore>
```
::: warning
`name` is cAsE sEnSitiVe
:::

While not likely, it *is possible* that a store you're trying to access has not been found/initialized by the time your plugin starts.

Therefore **it is strongly recommended** to rely on this function (instead of `flux.stores`/`flux.storesFlat`) if you need to access a store as soon as possible, immediately at plugin load.

### `shelter.flux.intercept`

```ts
function intercept(cb: (dispatch: object) => void | any | false): () => void
```

`intercept` allows you to listen to, modify, and block Flux dispatches.

The returned function, when called, will remove your interceptor (calling it multiple times is fine).

Your callback will be passed every dispatch that happens.

If you return a *nullish value* (`undefined` or `null`), or do not return at all, the dispatch will be unmodified (direct modifications to the dispatch objects will work fine, however).

If you return a *falsy value* (`false`, `0`, `""`, [and a few others](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)) that is not nullish, the dispatch will be blocked - it *will* be passed onto further interceptors and but *not* to subscribers - and thus stores.

If you return an object, then the dispatch will be replaced with the object you returned, allowing you to modify the dispatches.

Here's some examples:

```ts
const unintercept = intercept((dispatch) => {
  // (very basic) antitrack
  if (dispatch.type === "TRACK") return false;

  // modification example (makes people never show as speaking in VC locally)
  if (dispatch.type === "SPEAKING") {
    return {...dispatch, speakingFlags: 0};
    // or instead, modify it inline
    dispatch.speakingFlags = 0;
    return; // this return also totally optional
  }
});
```

## `shelter.http`

Shelter exposes Discord's internal HTTP functions, which may be used to commit authenticated requests,
as well as powerful utilities to intercept and modify them.

The following methods are available: `get`, `post`, `put`, `patch` and `del`.
These functions may simply be passed an URL or a request object, which is extensively described in the shelter typings.

Be careful directly making requests, as this carries the highest risk of selfbot related bans,
though this is already lowered by doing it via Discord HTTP compared to doing it manually.

::: warning
These are specifically for Discord endpoints only, not for anything else. Do not try to use these for general fetching.
:::

### `shelter.http.ready`
`ready` is a Promise that resolves as soon as the HTTP functions are available,
which is not necessarily the case when your plugin is loaded.

It is strongly recommended to `await shelter.http.ready;` before using the HTTP functions
(`get`, etc.)

You need not await this to use `intercept`.

### `shelter.http.intercept`
```ts
function intercept(method: Method, filter: string | RegExp | FilterFn, callback: InterceptFn): () => void;
```

`intercept` allows you to intercept and modify all authenticated HTTP requests that Discord makes.

The returned function, when called, will remove your interceptor (calling it multiple times is fine).

`method` should be one of the aboved listed HTTP methods, only requests of this method will be passed to your interceptor.

`filter` is used to filter by the request's URL, this may be a string, a regular expression or a function, this function is passed the URL as a string and is expected to return a boolean that decides whether or not to intercept this request.

Finally, `callback` is called for every request that passes the above criteria.

`callback` is passed both the request `req` and a function `send`.
Calling `send` executes the rest of the interceptor chain (or, if you're the last interceptor to run, executes the request) with the passed request, it returns a Promise that resolves to the response. Finally, your interceptor function should return a response.

You **may** omit calling `send` and return a fake response, you **may not** call `send` more than once.

Here are some examples:
```ts
// String filter, pass all matching requests through unmodified
shelter.http.intercept("get", "/users/@me", (req, send) => {
  return send(req);
});

// Regex filter, modify all sent message to end in the specified prefix
shelter.http.intercept("post", /\/channels\/\d+\/messages/, (req, send) => {
  req.body.content += " modified by shelter!";
  return send(req);
});

// Function filter, modify the response
shelter.http.intercept("get", (url) => url === "/users/@me", async (req, send) => {
  const res = await send(req);

  res.body.id = "123";

  return res;
});
```

### `shelter.http._raw`
This property exposes the raw export of the Discord HTTP module, you may use it to directly patch a function, note that in almost all cases, the interception API should be used instead. Just as the request functions themselves, this is only available once `ready` resolves.

## `shelter.patcher`

The patcher lets you patch functions on objects. It is not particularly oft-used in shelter, but it is here!

View the documentation for the patcher [here](https://github.com/Cumcord/spitroast#readme).

[These docs](https://github.com/Cumcord/docs/blob/main/plugin-guide/README.md#cumcordpatcherafter-) are also useful reading.

## `shelter.solid`

shelter uses [Solid](https://www.solidjs.com/) as its native UI framework that is used to write its UI and the UI of plugins, as well as provide reactivity.

This is where the full `solid-js` package is exported.

Note that if you use the Lune plugin builder, you can import from the `solid-js` package as usual.

## `shelter.solidWeb`

As above, `solid-js/web`

## `shelter.solidStore`

As above, `solid-js/store`

## `shelter.solidH`

### `shelter.solidH.h`

```ts
function h(type: string | Component<any>, ...children: (JSXElement | (() => JSXElement))[]): () => JSXElement;
function h(type: string | Component<any>, props: Record<string, any>, ...children: (JSXElement | (() => JSXElement))[]): () => JSXElement;
```

The [hyperscript interface](https://github.com/solidjs/solid/tree/main/packages/solid/h) to SolidJS.

Intended to help in-console debugging and writing plugins without Lune.

### `shelter.solidH.html`

This is a [htm](https://github.com/developit/htm) tagged template, that lets you use JSX-like syntax to create solid
elements at runtime.

To template using reactive values, you should pass them as no-element functions e.g.:
```js
const [count, setCount] = createSignal();

setInterval(() => setCount(count() + 1), 500);

// html``
return html`
  <div>${() => count() * 2}</div>
`;

// JSX equivalent:
return <div>{count() * 2}</div>;
```

Note that you must also make sure you have the argument specified for event handlers, else they will be interpreted
by solid's templater as a reactive value:
```ts
//                        YES  ⬇️
return html` <button onClick=${(e) => console.log("clicked")}>Click me!</button> `;

//                         NO  ⬇️
return html` <button onClick=${() => console.log("clicked")}>Click me!</button> `;
```

Remember that this returns a function, which you call within a component to retreive the value, for reactivity reasons.

## `shelter.React`

Discord's instance of [React](https://react.dev/) (`react`).

## `shelter.ReactDOM`

As above (`react-dom`).

## `shelter.util`

Contains various utility functions that may be useful to you.

### `shelter.util.getFiber`

```ts
function getFiber(node: DOMNode): Fiber
```

Gets a React *fiber* from a DOM node.
The fiber contains information about the state of the React element that Discord used to render the UI,
and can be useful to extract, for example, message objects from the DOM.

### `shelter.util.getFiberOwner`

```ts
function getFiberOwner(node: DOMNode | Fiber): FiberOwner
```

Gets the next React *fiber owner instance* from a DOM node or Fiber.
While owner instances only exist on React Class Components, it is pretty powerful as it provides
the `forceUpdate` function that allows direct rerendering of it's component.
This is typically used after patching or unpatching the component's `render` function
to have the component rerender with the changes.

### `shelter.util.reactFiberWalker`

```ts
function reactFiberWalker(
  node: Fiber,
  filter: string | symbol | ((node: Fiber) => boolean),
  goUp = false,
  ignoreStringType = false,
  recursionLimit = 100
): undefined | null | Fiber;
```

This is a tree walker designed to make finding things you need in the React fiber tree easier.

The filter is either a key to look for on the *props* of the fiber, or a function which takes a fiber and does a custom check.

By default, the walker will look at siblings and children of the current fiber, but if passed `goUp` then it will instead look up the tree (and at siblings failing that).

`ignoreStringType` will skip nodes that have a `type` which is a string - that is, normal DOM nodes, and so will only consider custom react components.

For example, if you had a DOM element inside a message, and you wanted to get the message author, you could do this:

```ts
const author = reactFiberWalker(getFiber(el), "message", true)?.message?.author;
```

To prevent freezing the main thread, there is a recursion limit. To disable it, set it to any value < 0.

### `shelter.util.awaitDispatch`

```ts
function awaitDispatch(filter: string | ((payload: any) => boolean)): Promise<any>
```

`awaitDispatch` returns a promise that will resolve when a dispatch that matches the filter occurs.

For example:

```ts
await awaitDispatch("LAYER_POP");
```

### `shelter.util.log`

```ts
function log(text: any | any[], func: "log" | "warn" | "error" = "log"): void;
```

`log` is shelter's log function. It prints a pretty shelter logo before your logs!

You may choose to use this to make your plugin's logs more identifiable.

### `shelter.util.createListener`

```ts
function createListener(type: string): solid.Accesssor<any>
```

This creates a Solid signal that contains the most recent dispatch object of the given type.

If you do not know what a signal is for, solid has [an excellent tutorial](https://www.solidjs.com/tutorial/introduction_signals) you can look at :)

The signal will contain `undefined` initially, until a relevant dispatch happens.

### `shelter.util.createSubscription`

```ts
function createSubscription<TState, TStoreData = any>(
  store: FluxStore<TStoreData>,
  getStateFromStore: (store: FluxStore<TStoreData>) => TState
): solid.Accessor<TState>
```

`createSubscription` creates a Solid signal that derives its value from a Flux store.

As above, if you don't know what a signal is for, solid has a great tutorial.

This will update the value of the signal every time the data in the store changes.

You must provide a function that takes the store and gets the data you want from it, like so:

```ts
const userObj = createSubscription(
  stores.UserStore,
  (ustore) => ustore.getUser("1045796505535135855")
);
// userObj() will be the most up to date user object for that user at any given point
```

### `shelter.util.storeAssign`

```ts
function storeAssign<T>(store: T, toApply: T): T
```

`storeAssign` works precisely like `Object.assign`, but it is useful for using [Solid reactive stores](https://www.solidjs.com/docs/latest/api#stores), as it will reduce extraneous reactive updates.

### `shelter.util.sleep`

```ts
function sleep(ms = 0): Promise<void>
```

`sleep` allows you to easily wait either a given amount of time, or for the next tick (`setTimeout`)

```ts
// equivalent of setTimeout()ing the rest of the code
await sleep();

// we just need to wait for 5 seconds
await sleep(5000);
```

### `shelter.util.createScopedApi`
```ts
function createScopedApi(): ScopedApi
```

`createScopedApi` creates a copy of all reversible shelter APIs, that can be all undone at once.
The returned object contains some but not all of the main shelter APIs, untouched.

The APIs returned are:
- [`shelter.flux.intercept`](#shelter-flux-intercept)
- [`shelter.http.intercept`](#shelter-http-intercept)
- [`shelter.observeDom`](#shelter-observedom)
- [`shelter.patcher.*`](#shelter-patcher)
- [`shelter.settings.registerSection`](#shelter-settings-registersection)
- [`shelter.ui.injectCss`](/ui#injectcss)

In addition, these new APIs are returned.
```ts
interface {
  disposeAllNow(): void;
  disposes: (() => void)[];
  onDispose(callback: () => void): void;
  flux: {
    subscribe(type: string, cb: (payload: any) => void): () => void;
  }
}
```

When any API on this object is called, its undo will be added automatically to the disposes array to be cleaned up.

`subscribe` matches `shelter.flux.dispatcher.subscribe`, but returns the unsubscribe function.

`disposes` is the array used to keep track of dispose callbacks.

`onDispose` allows you to easily register your own callback to be disposed.

`disposeAllNow` will call all dispose callbacks and clear the array.

::: tip
Inside shelter plugins, you have a scoped API instance pre-provided under
[`shelter.plugin.scoped`](#shelter-plugin-scoped).
:::

## `shelter.ui`

shelter provides a rich set of UI tools, with some utils to help with UI related things, and some faithful remakes of Discord's UI components in Solid.

This is documented separately: [shelter UI](/ui).

## `shelter.settings`

shelter provides tools to inject into the user settings page of Discord.

It can inject a divider, a header, a section with a component, or a button with an action.

### `shelter.settings.registerSection`

```ts
function registerSection("divider"): () => void
function registerSection("header",  text: string): () => void
function registerSection("section", id: string, label: string, comp: solid.Component, extras?: any): () => void
function registerSection("button",  id: string, label: string, action: () => void): () => void
```

`registerSection` adds a setting to the user settings.

The returned function, when called, removes the section you injected.

A `section` and can optionally be passed in extra properties, such as a `badgeCount` (or whatever else you find that works):

```ts
const remove = registerSection(
  "section",
  "alerts",
  "Alerts",
  AlertList,
  {
    badgeCount: 5
  }
);
```

## `shelter.plugin`

These APIs are exposed only to plugins, and are specific to the plugin they are accessed from.

### `shelter.plugin.store`

`store` is a solid mutable store, which you can use to store persistent data. You may treat it just like an object.

Whenever you modify a property on the store, it will be saved. (note this applies to only top level properties, not objects inside objects)

You may store anything as long as it is serializable.
The list of types allowed can be found [here](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types),
circular references are not allowed. Notably, functions are not allowed.

For example:

```ts
// run this one time...
store.foo = 5;

// then the next time your plugin loads:
store.foo // 5
```

### `shelter.plugin.flushStore`

```ts
function flushStore(): void
```

If you deeply modify something in the store, where it will not be automatically picked up (e.g. `store.foo.bar = "baz"`), you may call `flushStore()` to force a save.

### `shelter.plugin.id`

```ts
id: string
```

The ID for this plugin, used by `shelter.plugins` APIs.

### `shelter.plugin.manifest`

`manifest` contains the manifest object for your plugin.

```ts
// for example:
plugin.manifest === {
  name: "Antitrack",
  author: "Yellowsink",
  description: "The essential.",
  hash: "2d8d76c008e0b37ed4e2eb1d9ea56a6d"
}
```

### `shelter.plugin.showSettings`

```ts
function showSettings(): void
```

`showSettings` imperatively shows the settings modal for your plugin, assuming you have settings.

### `shelter.plugin.scoped`

A [scoped API](#shelter-util-createscopedapi) instance that cleans up automatically on unload.

## `shelter.plugins`

Shelter provides multiple APIs for managing installed plugins programmatically.

These will be more sparsely documented as if you are directly using these it is assumed that you understand how shelter's internals (at least, the plugin loader) work - feel free to read the source!

### `shelter.plugins.installedPlugins`

`installedPlugins` is a Solid signal that returns the installed shelter plugins, as a `Record<string, StoredPlugin>`.

An example:

```ts
installedPlugins() === {
  "yellowsink.github.io/shelter-plugins/antitrack/": {
	js: "...",
    on: true,
    src: "https://yellowsink.github.io/shelter-plugins/antitrack/",
    update: true,
    manifest: {
      author: "Yellowsink",
      description: "The essential.",
      hash: "2d8d76c008e0b37ed4e2eb1d9ea56a6d",
      name: "AntiTrack"
    }
  }
}
```

### `shelter.plugins.loadedPlugins`

`loadedPlugins` is a Solid signal containing the evaled plugins currently loaded. It is, similarly to `installedPlugins`, a record of string to objects, where the objects contain the exports of the plugin bundles.

This generally consists of `onUnload`, and optionally `settings` and `onLoad`.

### `shelter.plugins.startPlugin`

```ts
function startPlugin(id: string): void
```

`startPlugin` starts an installed but unloaded plugin.

### `shelter.plugin.stopPlugin`

```ts
function stopPlugin(id: string): void
```

`stopPlugin` stops an installed and loaded plugin.

### `shelter.plugins.addLocalPlugin`

```ts
function addLocalPlugin(id: string, plugin: {
  js: string,
  update: boolean,
  src?: string,
  manifest: Record<string, string>
}): void
```

`addLocalPlugin` adds a plugin from JS source code and a manifest object.

### `shelter.plugins.addRemotePlugin`

```ts
function addRemotePlugin(id: string, src: string, update = true): Promise<void>
```

`addRemotePlugin` installs a plugin from a URL.

### `shelter.plugins.updatePlugin`

```ts
function updatePlugin(id: string): Promise<boolean>
```

`updatePlugin` checks for an update, and if there is one, updates the plugin.
It returns whether or not an update was installed.

### `shelter.plugins.removePlugin`

```ts
function removePlugin(id: string): void
```

`removePlugin` removes a plugin.

hmm yes, the floor here is made out of floor.

### `shelter.plugins.getSettings`

```ts
function getSettings(id: string): solid.Component | undefined
```

`getSettings` grabs the Solid settings component for the plugin, if the plugin has settings.

### `shelter.plugins.showSettingsFor`

```ts
function showSettingsFor(id: string): Promise<void>
```

Shows a settings modal for the plugin of the given ID.
The returned promise resolves when the modal is closed.

### `shelter.plugins.editPlugin`

```ts
function editPlugin(id: string, overwrite: StoredPlugin): void
```

`editPlugin` edits a plugin. Pass a new plugin object to overwrite the old one.

Note that this is a little more basic than you may expect - the edit modal plays some extra tricks,
notably, the auto-updating behaviour for remote plugins is not provided by this function,
and the edit modal does it in a cleverer way than just calling this then update, too.

## Plugin exports

These are not what shelter provides to you, but rather what your plugin should provide back to shelter.
If you write your plugins directly, it should be a JS expression evaluating to an object containing these exports.
If you write your plugins with Lune or another bundler,
generally these correspond to [ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) exports.

### `onLoad`

`onLoad` is an optional export of the form `function onLoad(): void`.
It is called immediately after your plugin has been evaluated, and can be used to perform initialization.

Note that you do not have to use this, and if you are using a build tool like Lune,
you may find it easier to do your initialization at the top level instead of within `onLoad`.

### `onUnload`

`onUnload` is an optional export of the form `function onUnload(): void`.
It is called when your plugin is unloaded. You should cleanup any effects of your plugin here.
This includes removing patches, subscriptions, flux and http intercepts, DOM observations, etc.

You should usually only omit this if you're using Scoped APIs.

### `settings`

If you want to provide a GUI settings menu for your plugin, you can use the optional `settings` export
of the form `function settings(): JSX.Element`.

This is a Solid component, and you should use the [shelter UI](/ui) components.