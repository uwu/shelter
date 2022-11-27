# shelter docs

## API

The API is exported on `window.shelter`.

### `flux`

- `dispatcher`: Discord's `FluxDispatcher`
- `stores`: Every Flux store in Discord
- `intercept()`: Allows you to intercept dispatches.

#### `intercept`

Pass intercept a callback.
This callback will receive every dispatch object.

To modify or block a dispatch, return an array:
`[modifiedDispatch: any, shouldAbort: boolean]`.

Returns a function to stop intercepting.

### `patcher`

https://github.com/cumcord/spitroast

### `solid`

https://solidjs.com

### `solidStore`

See above.

### `solidWeb`

See above.

### `observeDom`

Call with a CSS selector and a callback to listen for DOM updates.

Returns a function to stop observing.

Please keep your observations as short as possible - we have tried
to make this as performant as possible but observing every DOM
change on a complex app like Discord _is_ slow and you should guide
when you are listening by other things e.g. Flux where possible.

### `plugins`

- `addLocalPlugin`: adds a plugin from code and metadata
- `addRemotePlugin`: installs a plugin from a URL
- `getSettings`: gets the settings component from a plugin ID
- `installedPlugins`: a signal for the currently installed plugin store
- `loadedPlugins`: a signal for the currently loaded plugin store
- `removePlugin`: yeah you can be malicious with this
- `startPlugin`: no, you cant start an already running plugin
- `stopPlugin`: useful for making people think their plugins broke

### `storage`

- `dbStore`: the `ShelterStore` instance used for general purpose _INTERNAL_ storage
- `defaults`: a helper for setting the default values of `ShelterStore`s
- `isInited`: tells you if a `ShelterStore` is or is not connected to IDB
- `signalOf`: gets a signal with an object from a `ShelterStore`
- `solidMutWithSignal`: wraps a solid mutable to provide a signal
- `storage`: creates a `ShelterStore` with a given name
- `waitInit`: returns a promise that resolves when the `ShelterStore` is connected to IDB
- `whenInited`: runs the cb when the `ShelterStore` is connected to IDB

There were caveats and useful gotchas about shelter stores iirc but I forgot
them -- sink

### `ui`

https://github.com/uwu/shelter/blob/main/packages/shelter-ui/README.md

### `React`, `ReactDOM`

I'm sure you can figure out what these are.

Please remember that shelter plugins should be using solid.
React is provided as an escape hatch for difficult situations.

### `unload`

Unloads the client.

### `util`

- `awaitDispatch`: waits for a dispatch of a given type
- `createListener`: gets a solid signal with the most recent dispatch of a given type
- `createSubscription`: turns a flux store into a reactive solid signal
- `storeAssign`: like object.assign but reactivity is batched. Use this to assign lots of things to a store.

### `plugin`

Be careful, `plugin` and `plugins` are very different.

These APIs only exist inside a plugin, not on the window global.

- `store`: the current plugin's reactive IDB-backed store
- `flushStore`: forces writing the store to IDB. Use this if you do some fuckery that doesn't trigger a write.
- `manifest`: the manifest json of your plugin
- `showSettings`: shows your plugin's settings

## Misc

Q: Why the hell do JS objects all have `_dispatchToken` on them now?

A: This is a part of shelter's flux store grabbing code.
It is necessary and is specifically designed to _NOT_ affect
existing JS code. You will only notice it in the devtools.
