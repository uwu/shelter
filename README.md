![shelter](https://github.com/uwu/shelter/raw/main/packages/shelter-assets/svg/banner.svg)

_an attempt to prepare for the worst_

[![wakatime](https://wakatime.com/badge/github/uwu/shelter.svg)](https://wakatime.com/badge/github/uwu/shelter)

## What is shelter?

shelter is a new generation client mod built to be essentially bulletproof.

Its development was sparked by the death of many client mods and the blow
to all others that was Discord's switch to SWC.

You can read much more about this event [here](https://web.archive.org/web/20230726025103/https://cumcord.com/an-exercise-in-futility).

It is developed by ex-members of the old Cumcord Team, under [uwu.network](https://uwu.network/).

## What plugins has it got?

Quite a few! See the automated list at https://shelter.uwu.network/plugins or [search for shelter-plugins](https://github.com/search?q=shelter-plugins&type=repositories).

## How do I install it?

### Desktop

- Download this repo.
- Find your Discord install folder (`%LocalAppData%` for Windows) and go into `resources/` - if theres a file called `app.asar` youre probably in the right place.
- From the repo you downloaded, copy the folder `shelter/injectors/desktop/app/` into `resources/`. 
- Close Discord and rename `app.asar` to `original.asar`. It should look like this:
```
🗁 resources/
 ├── 🗁 app/
 │    ├── 🗋 index.js
 │    ├── 🗋 preload.js
 │    └── 🗋 package.json
 └── 🗋 original.asar
```
- Start Discord and you should find a section called `shelter` in the settings.

### Kernel

An alternative desktop installation method is [Kernel](https://kernel.fish).
The kernel package is in `injectors/kernel`, if you use this method I expect you to know how to install Kernel yourself.
This is nice because you can run multiple mods at once.

### Firefox

https://addons.mozilla.org/firefox/addon/shelter-injector/

### Microsoft Edge

https://microsoftedge.microsoft.com/addons/detail/shelter-mv3-inj/okemjpeidkmhjpmdcpaibakdhnheblib

### Chrome (Opera, Brave, etc.)

The MV3 extension got removed from the chrome store because it runs remotely hosted code (shelter and the plugins you download).
As there's no easy way to comply with that policy we won't make our extension available on the chrome store.
However, you can still install it manually:

- Download the latest MV3 Injector from Releases
- Unpack the .zip file
- Head to `chrome://extensions`
- Enable Developer mode
- Load the unpacked extension

## How do I make a plugin?

See [the docs](https://shelter.uwu.network/guides/)

## Is there a plugin repo / website / etc.?

Centralised plugin repo: no, not yet.

Website: There are the docs publicly available at https://shelter.uwu.network,
but these are currently more geared for plugin developers than end users.

We are working on improving the ecosystem slowly but surely, much is in the works.

Keep an eye on the uwu gh org or [our Discord server](https://discord.gg/FhHQQrVs7U)
to see what we are working on, inside and outside of the client modding space. :)
