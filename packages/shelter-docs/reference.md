# shelter API Reference

This document lists all the APIs exposed on `window.shelter`, and how they work.

They are all available on the global, but the `shelter.plugin` API (note: different `shelter.plugins`) is only available from within a plugin, and contains plugin-specific APIs.

API functions will have their TypeScript signatures listed.

## Top level

### `shelter.observeDom`

```ts
observeDom(selector: string, cb: (node: DOMNode) => void): {(): void; now(): void}
```

shelter provides a DOM observer, which is an abstraction over [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver). This allows you to efficiently listen for changes to the document.

The returned function can be called to stop this observation. Calling it more than once is fine.

All elements modified in the current batch will cause the observation to fire, even after unobserving.
To instantly stop sending elements to your callback, replace `unobserve()` with `unobserve.now()`.

This is intended behaviour so that you can use unobserve in your callback,
even if you intend to listen for a whole list of elements.

`selector` is a [CSS Selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors).

Generally, you would do this to wait for React to render something you are interested in.

It is recommended to provide a fallback timeout to prevent leaving observations forever.

Your function will be called once per matched element, however if you call the unobserve function at any point it will stop calling your callback immediately, even if there were more matching elements changed in the batch.

A common pattern is to use this after hearing a flux dispatch (see Flux below):

```ts
function handleDispatch() {
  const unObserve = observeDom("h3 time[id^=message-timestamp]", (el) => {
	unObserve(); // only listen for a single matching element
	doInterestingThings(el);
  });
  // we expect to see a change in the DOM before 3s after the dispatch
  setTimeout(unObserve, 3000);
}

dispatcher.subscribe("EVENT_TYPE", handleDispatch);
```

### `shelter.unload`

```ts
unload(): void
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
```

> ***IMPORTANT NOTE!***
>
> As these stores contain almost all client-side state within Discord, there is sensitive data contained within some of them. Be VERY careful with your handling of this data, if you choose to use it - remember that [data is radioactive!](https://twitter.com/FiloSottile/status/1162404848073170944)
>
> I know that me writing this will draw it to malicious authors' attention that this is easily possible, but its worth the note before some dev someone inadvertently posts their own user object or something ;)

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
awaitStore(name: string, awaitInit = true): Promise<FluxStore>
```
> Beware that `name` is cAsE sEnSitiVe

While not likely, it *is possible* that a store you're trying to access has not been found/initialized by the time your plugin starts.

Therefore **it is strongly recommended** to rely on this function (instead of `flux.stores`/`flux.storesFlat`) if you need to access a store as soon as possible, immediately at plugin load.

### `shelter.flux.intercept`

```ts
intercept(cb: (dispatch: object) => void | any | false): () => void
```

(For the pedantic - this is not the type signature included in the shelter type defs, as this is more illustrative and the type defs are instead designed for computers to use nicely.)

`intercept` allows you to listen to, modify, and block Flux dispatches.

The returned function, when called, will remove your interceptor (calling it multiple times is fine).

Your callback will be passed every dispatch that happens.

If you return a *nullish value* (`undefined` or `null`), or do not return at all, the dispatch will be unmodified (direct modifications to the dispatch objects will work fine, however).

If you return a *falsy value* (`false`, `0`, `""`, [and a few others](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)) that is not nullish, the dispatch will be blocked - it *will* be passed onto further interceptors and but *not* to subscribers - and thus stores.

If you return an object, then the dispatch will be replaced with the object you returned, allowing you to modify the dispatches.

Here's some examples:

```ts
const unintercept = intercept((dispatch) => {
  // (basic) antitrack
  if (dispatch.type === "TRACK") return false;

  // modification example (makes people never show as speaking!)
  if (dispatch.type === "SPEAKING") {
    return {...dispatch, speakingFlags: 0};
    // or...
    dispatch.speakingFlags = 0;
    return;
  }
});
```

## `shelter.patcher`

The patcher lets you patch functions on objects. It is not particularly oft-used in shelter, but it is here!

View the documentation for the patcher [here](https://github.com/Cumcord/spitroast#readme).

## `shelter.solid`

shelter uses [SolidJs](https://www.solidjs.com/) as its native UI framework that is used to write its UI and the UI of plugins, as well as provide reactivity.

This is where the full `solid-js` package is exported.

Note that if you use the Lune plugin builder, you can import from the `solid-js` package as usual.

## `shelter.solidWeb`

As above, `solid-js/web`

## `shelter.solidStore`

As above, `solid-js/store`

## `shelter.React`

Discord's instance of [React](https://react.dev/) (`react`).

## `shelter.ReactDOM`

As above (`react-dom`).

## `shelter.util`

Contains various utility functions that may or not be useful to you.

### `shelter.util.getFiber`

```ts
getFiber(node: DOMNode): Fiber
```

Gets a React *fiber* from a DOM node. The fiber contains information about the state of the React element that Discord used to render the UI, and can be useful to extract, for example, message objects from the DOM.

### `shelter.util.getFiberOwner`

```ts
getFiberOwner(node: DOMNode | Fiber): FiberOwner
```

Gets the next React *fiber owner instance* from a DOM node or Fiber. While owner instances only exist on React Class Components, it is pretty powerful as it provides the `forceUpdate` function that allows direct rerendering of it's component. This is typically used after patching or unpatching the component's `render` function to have the component rerender with the changes.

### `shelter.util.reactFiberWalker`

```ts
reactFiberWalker(
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
awaitDispatch(filter: string | ((payload: any) => boolean)): Promise<any>
```

`awaitDispatch` returns a promise that will resolve when a dispatch that matches the filter occurs.

For example:

```ts
await awaitDispatch("LAYER_POP");
```

### `shelter.util.log`

```ts
log(text: any, func: "log" | "warn" | "error" = "log"): void;
log(text: any[], func: "log" | "warn" | "error" = "log"): void;
```

`log` is shelter's log function. It prints a pretty shelter logo before your logs!

You may choose to use this to make your plugin's logs more identifiable.

### `shelter.util.createListener`

```ts
createListener(type: string): solid.Accesssor<any>
```

This creates a SolidJS signal that contains the most recent dispatch object of the given type.

If you do not know what a signal is for, solid has [an excellent tutorial](https://www.solidjs.com/tutorial/introduction_signals) you can look at :)

The signal will contain `undefined` until a relevant dispatch happens.

### `shelter.util.createSubscription`

```ts
createSubscription<TState, TStoreData = any>(
  store: FluxStore<TStoreData>,
  getStateFromStore: (store: FluxStore<TStoreData>) => TState
): solid.Accessor<TState>
```

`createSubscription` creates a SolidJS signal that derives its value from a Flux store.

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
storeAssign<T>(store: T, toApply: T): T
```

`storeAssign` works precisely like `Object.assign`, but it is useful for using [SolidJS reactive stores](https://www.solidjs.com/docs/latest/api#stores), as it will reduce extraneous reactive updates.

### `shelter.util.sleep`

```ts
sleep(ms = 0): Promise<void>
```

`sleep` allows you to easily wait either a given amount of time, or for the next tick (`setTimeout`)

```ts
// equivalent of setTimeout()ing the rest of the code
await sleep();

// we just need to wait for 5 seconds
await sleep(5000);
```

## `shelter.storage`

> ***POSSIBLE CONFUSION ALERT***
>
> *shelter stores* are a very specific terminology, and refers to a store tied very directly to IndexedDB, and the caveats (initing) that come with that.
>
> If you are only concerned with storing things from your plugin *you should use the plugin store and not use this*.
>
> `plugin.store`, the storage you are given in plugins, are NOT shelter stores, the `shelter.storage.*` APIs will NOT work with them, and they do not suffer from the initing issue described later.

Shelter implements a storage API backed by [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API). The stores behave as if they were just objects:tm:, and have interoperability with SolidJS for reactivity.

You may store anything as long as it is [cloneable](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types) (basically, no circular references and no functions).

> ***IMPORTANT NOTE***
>
> While these stores will save data when you modify them, its very important to note that they are not *deeply* reactive.
>
> That is `store.foo = {}` will save but `store.foo.bar = {}` will not save.

### `shelter.storage.storage`

```ts
storage<T = any>(name: string): ShelterStore<T>
```

`storage` constructs a shelter store with string keys and values of type `T`. It will be backed by the IDB store given by `name`, and thus will persist across reloads of Discord (and thus shelter).

Your returned shelter store behaves just like an object - you may assign to, `delete`, and iterate over the store just as normal.

> ***IMPORTANT NOTE***
>
> IndexedDB, which backs shelter stores, is asynchronous, and when you create your store, the persisted data will *NOT* be available.
>
> You may start writing to the store safely, and shelter will try its absolute best to make everything just work:tm: (it will in 99% of cases), but if you wish to read, you should *wait for* your store - see the docs for notable functions below!

### `shelter.storage.isInited`

```ts
isInited(store: ShelterStore<unknown>): boolean
```

`isInited` checks if a shelter store is connected to IndexedDB.

As noted in the docs for `storage()`, you must make sure the store has connected to IDB before you start reading from it.

### `shelter.storage.whenInited`

```ts
whenInited(store: ShelterStore<unknown>, cb: () => void): void
```

`whenInited` waits for IndexedDB to connect to the store, and then runs the passed callback.

If the store is already connected to IDB, the callback will be run immediately,

### `shelter.storage.waitInit`

```ts
waitInit(store: ShelterStore<unknown>): Promise<void>
```

`waitInit` returns a promise that will resolve when IDB connects to the store, or instantly if it is already connected.

If you are working with stores directly, and can use `async` in your code, this is usually the best option to wait for IDB connection:

```ts
// given my-cool-store already exists from a previous run, and contains { foo: "bar" }:
const store = storage("my-cool-store");
store.foo // undefined
await waitInit(store);
store.foo // "bar"
```

### `shelter.storage.defaults`

```ts
defaults<T = any>(store: ShelterStore<T>, fallbacks: Record<string, T>): void
```

`defaults` is useful to set default fallbacks on your store - it checks each key in fallbacks, and if it does not exist in the store, sets it.

The reason to use `defaults` over just a simple `??=` yourself is that it correctly handles stores that are not yet connected to IDB.

When used in plugins, this is not necessary (see `shelter.plugin.store`).

### `shelter.storage.signalOf`

```ts
signalOf<T = any>(store: ShelterStore<T>): solid.Accessor<Record<string, T>>
```

`signalOf` creates a SolidJS signal that always contains the most up to date value of the shelter store as a flat object.

It will reactively update when you modify the store (console logs shown in comments where they will occur):

```ts
const myStore = storage("my-cool-store");
const sig = signalOf(myStore);
solid.createEffect(() => console.log(sig())); // {}
myStore.foo = "bar"; // {foo: "bar"}
myStore.baz = "test"; // {foo: "bar", baz: "test"}
delete myStore.foo; // {baz: "test"}
```

### `shelter.storage.solidMutWithSignal`

```ts
solidMutWithSignal<T extends object = any>(store: T): [T, solid.Accessor<T>]
```

`solidMutWithSignal` does not actually apply to shelter stores at all, instead it is a utility for `solid-js/store/mutable`, and is just placed here as it is a logical place to put it.

It takes a SolidJS mutable store, and splits it into two parts - another mutable store (which you must use instead of the original if you want the signal to work), and a signal of the overall value (just like `signalOf`).

## `shelter.ui`

shelter provides a rich set of UI tools, with some utils to help with UI related things, and some faithful remakes of Discord's UI components in SolidJS.

This is documented separately in [the `shelter-ui` package](https://github.com/uwu/shelter/tree/main/packages/shelter-ui#readme).

## `shelter.settings`

shelter provides tools to inject into the user settings page of Discord.

It can inject a divider, a header, a section with a component, or a button with an action.

### `shelter.settings.registerSection`

```ts
registerSection("divider"): () => void
registerSection("header", text: string): () => void
registerSection("section", id: string, label: string, comp: solid.Component): () => void
registerSection("button", id: string, label: string, action: () => void): () => void
```

`registerSection` adds a setting to the user settings.

The returned function, when called, removes the section you injected.

## `shelter.plugin`

These APIs are exposed only to plugins, and are specific to plugins.

### `shelter.plugin.store`

`store` is a solid mutable store, which you can use to store persistent data. You may treat it just like an object.

Whenever you modify a property on the store, it will be saved. (note this applies to only top level properties, not objects inside objects)

For example:

```ts
// run this one time...
store.foo = 5;

// then the next time your plugin loads:
store.foo // 5
```

### `shelter.plugin.flushStore`

```ts
flushStore(): void
```

If you deeply modify something in the store, where it will not be automatically picked up (e.g. `store.foo.bar = "baz"`), you may call `flushStore()` to force a save.

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
showSettings(): void
```

`showSettings` imperatively shows the settings modal for your plugin, assuming you have settings.

## `shelter.plugins`

Shelter provides multiple APIs for managing installed plugins programmatically.

These will be more sparsely documented as if you are directly using these it is assumed that you understand how shelter's internals (at least, the plugin loader) work - feel free to read the source!

### `shelter.plugins.installedPlugins`

`installedPlugins` is a SolidJS signal that returns the installed shelter plugins, as a `Record<string, StoredPlugin>`.

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

`loadedPlugins` is a SolidJS signal containing the evaled plugins currently loaded. It is, similarly to `installedPlugins`, a record of string to objects, where the objects contain the exports of the plugin bundles.

This generally consists of `onUnload`, and optionally `settings` and `onLoad`.

### `shelter.plugins.startPlugin`

```ts
startPlugin(id: string): void
```

`startPlugin` starts an installed but unloaded plugin.

### `shelter.plugin.stopPlugin`

```ts
stopPlugin(id: string): void
```

`stopPlugin` stops an installed and loaded plugin.

### `shelter.plugins.addLocalPlugin`

```ts
addLocalPlugin(id: string, plugin: {
  js: string,
  update: boolean,
  src?: string,
  manifest: Record<string, string>
}): void
```

`addLocalPlugin` adds a plugin from JS source code and a manifest object.

### `shelter.plugins.addRemotePlugin`

```ts
addRemotePlugin(id: string, src: string, update = true): Promise<void>
```

`addRemotePlugin` installs a plugin from a URL.

### `shelter.plugins.removePlugin`

```ts
removePlugin(id: string): void
```

`removePlugin` removes a plugin.

hmm yes, the floor here is made out of floor.

### `shelter.plugins.getSettings`

```ts
getSettings(id: string): solid.Component | undefined
```

`getSettings` grabs the SolidJS settings component for the plugin, if the plugin has settings.
