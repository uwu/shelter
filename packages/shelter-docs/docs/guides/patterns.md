# Plugin development patterns

This page lists common patterns you will use in your plugins very often,
and are generally safe.

- subscribe, observe, fiber
- dispatch (intercept) modification
  * no reply mention
  * timestamp file names
  * free profile colours
- store patching
  * prevent spotify pause
- http requests
  * mute new guilds (tasky)
  * text replacements
- long lived observes
  * freemoji (aw)
  * gpt

## Sub-Observe

One of the most common patterns you'll see in shelter plugins is the pairing of a
[flux subscription](/reference#shelter-flux-dispatcher)
and a [DOM observation](/reference#shelter-observedom).
This is because it makes it relatively easy to directly modify the UI.

The pattern looks like this:
```js
function handleElement(e) {
  // prevent handling the same element many times
  // :not in the selector below filters out in a performant way
  // if you're writing async code and you get duplicates, you can try adding this too:
  //     if (e.dataset.myPluginName) return;
  e.dataset.myPluginName = 1;

  const fiber = shelter.util.getFiber(e);
  // do whatever you want with the element here n stuff.
}

function handleDispatch(payload) {
  const unobs = shelter.observeDom("whatever:not([data-my-plugin-name])", e => {
    unobs();
    handleElement(e);
  });
  setTimeout(unobs, 200);
}

const TRIGGERS = ["CHANNEL_SELECT", "LOAD_MESSAGES_SUCCESS"];
for (const t of TRIGGERS) shelter.plugin.scoped.flux.subscribe(t, handleDispatch);
```

This does a lot but is generally something you will see in a lot of places because it's a reliable way to modify
elements on the page without a noticeable performance impact.

[//]: # (TODO: link "fiber" to background)
The fiber gives us a lot of useful context and information we can use to help fetch information we need.

If you've read the [Your First Plugin](plugin) guide, this should look quite familiar to you!

### Some plugins with this pattern:
 - [Invidivizer, Yellowsink](https://github.com/yellowsink/shelter-plugins/blob/master/plugins/invidivizer/index.jsx)
 - [Channel Typing Indicators, ioj4](https://github.com/ioj4/shelter-plugins/blob/master/plugins/channel-typing-indicators/index.jsx)
 - [Open Profile Images, ioj4](https://github.com/ioj4/shelter-plugins/blob/master/plugins/open-profile-images/index.jsx)

## Dispatch Interception

[Dispatch interception](/reference#shelter-flux-intercept) is a very efficient way to make client side changes
involving modifying or preventing behaviours.

It tends to look something like this:
```js
shelter.plugin.scoped.flux.intercept(dispatch => {
  if (dispatch.type !== "CREATE_PENDING_REPLY") return;

  // modify `dispatch` directly or `return false` to block the dispatch.
});
```

The form this takes varies, be it modifying a detail of an action or intercepting the results of a data fetch.

### Some plugins with this pattern:
 - [No Reply Mention, SpikeHD](https://github.com/SpikeHD/shelter-plugins/blob/main/plugins/no-reply-mention/index.ts)
 - [Timestamp File Names, ioj4](https://github.com/ioj4/shelter-plugins/blob/master/plugins/timestamp-file-names/index.js)
 - [Free Profile Colours, maisy](https://github.com/maisymoe/furniture/blob/master/plugins/FreeProfileColors/index.ts)

## Store Patching

Often, you can achieve what you need by sitting in between a store and things that use it, by
[patching](/reference#shelter-patcher) it.

This looks something like this:
```js
// give all users a discriminator based on their username
// running this example in your discord will make it crash and break in fun ways
function process(user) {
  user.discriminator = user.username.length.toString().padStart(4, "0");
}

const unpatch1 = shelter.patcher.after(
  "getUser",
  UserStore.__proto__,
  (args, ret) => process(ret)
);
const unpatch2 = shelter.patcher.after(
  "getUsers",
  UserStore.__proto__,
  (args, ret) => {
    for (const id in ret)
      process(ret[id])
    }
);
```

### Some plugins with this pattern:
 - [Prevent Spotify Pause, ioj4](https://github.com/ioj4/shelter-plugins/blob/master/plugins/prevent-spotify-pause/index.js)

// TODO finish off.