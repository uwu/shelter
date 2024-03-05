# Plugin development patterns

This page lists common patterns you will use in your plugins very often,
and are generally safe.

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
 - [Invidivizer, Yellowsink](https://github.com/yellowsink/shelter-plugins/blob/0fe8bf062cae0e9ce7688d091f8953ff0934a301/plugins/invidivizer/index.jsx)
 - [Channel Typing Indicators, ioj4](https://github.com/ioj4/shelter-plugins/blob/8e80fc012a5b39b33ef30203f9684afc599e1801/plugins/channel-typing-indicators/index.jsx)

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
 - [No Reply Mention, SpikeHD](https://github.com/SpikeHD/shelter-plugins/blob/2621b32a1cb9c968a6e35d5febf279accf75a790/plugins/no-reply-mention/index.ts)
 - [Timestamp File Names, ioj4](https://github.com/ioj4/shelter-plugins/blob/f290f7c8e19bdc50aef976be22824ee954c99943/plugins/timestamp-file-names/index.js)
 - [Free Profile Colours, maisy](https://github.com/maisymoe/furniture/blob/a4545acc9b9dae198007708eff1bddf78ae6661f/plugins/FreeProfileColors/index.ts)

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
 - [Prevent Spotify Pause, ioj4](https://github.com/ioj4/shelter-plugins/blob/dd74f51d8bb39f6513139041e4752bf45b4bc91a/plugins/prevent-spotify-pause/index.js)

## HTTP Requests

shelter allows you to make and intercept HTTP requests before they hit the Discord API. This is very powerful and
bridges the gap from client side changes via flux to server side changes via the API.

::: danger
Be careful! Making HTTP requests yourself has the potential to cause bans!
Generally the risk of this is much lower via shelter than manually via fetch, but it's still there.
Intercepting requests should be low risk, but it is suggested to attempt to test an action yourself for real, and
attempt to mimic that.
Do not use Discord's developer docs as a resource as some of the endpoints are bot-only, and are different for users.
:::

::: warning
These are specifically for Discord endpoints only, not for anything else. Do not try to use these for general fetching.
:::

You can make a request yourself, such as muting a guild:
```js
shelter.http.patch({
  body: { muted: true, suppress_everyone: true, suppress_roles: true },
  url: `/users/@me/guilds/${guild_id}/settings`
})
```

You can also modify an outgoing HTTP request, such as modifying messages:
```js
// makes you more happy :)
shelter.http.intercept("POST", /\/channels\/\d+\/messages/, async (req, send) => {
  req.body.content = req.body.content.replaceAll(":(", ":)");
  const response = await send(req);
  return response;
});
```

Or even just block requests entirely:
```js
shelter.http.intercept("POST", "/science", () => {});
```

### Some plugins with this pattern:
 - [Antitrack, Yellowsink](https://github.com/yellowsink/shelter-plugins/blob/91efdf57385794d4b189748431b89fb4deebe9c8/plugins/antitrack/index.js)
 - [Mute New Guilds, taskylizard](https://github.com/taskylizard/shelter-plugins/blob/259b1d09ed8d0b349d35cc3e95e3f2dbb3e9e9b4/plugins/mutenewguild/index.ts)
 - [Text Replacements, Yellowsink](https://github.com/yellowsink/shelter-plugins/blob/91efdf57385794d4b189748431b89fb4deebe9c8/plugins/text-replacements/index.ts)

## Long Lived Observers

The [DOM Observer](/reference#shelter-observedom) is intended to be used momentarily to listen for an anticipated change
to the page.
Some plugins skip the step of waiting for reason to believe a change will happen, and just add a listener at plugin
load that lives until unload.

Basically, its the same as sub-observe, but without the flux part:
```js
function handleElement(e) {
  e.dataset.myPluginName = 1;

  const fiber = shelter.util.getFiber(e);
  // do whatever you want with the element here n stuff.
}

shelter.plugin.scoped.observeDom("whatever:not([data-my-plugin-name])", handleElement);
```

::: warning
This pattern simplifies the development process and increases reliability, _however_ it means shelter has to watch the
page constantly for as long as your plugin is running, which could in theory decrease performance.
In my testing (on a reasonably modern system, in Firefox) it has an impact too small to measure in practice.
:::

### Some plugins with this pattern:
- [Open Profile Images, ioj4](https://github.com/ioj4/shelter-plugins/blob/cabec08563b8639b3a62ec067672eaa0b6ddd17c/plugins/open-profile-images/index.jsx)
- [Freemoji, Yellowsink](https://github.com/yellowsink/shelter-plugins/blob/91efdf57385794d4b189748431b89fb4deebe9c8/plugins/freemoji/index.js)
- [GPT, edde746](https://github.com/edde746/shelter-plugins/blob/0bcee4af88163442ee514ac390cb35953e881ce6/plugins/gpt/index.jsx)
