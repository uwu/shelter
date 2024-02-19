![shelter](https://github.com/uwu/shelter/raw/main/packages/shelter-assets/svg/banner.svg)

_an attempt to prepare for the worst_

[![wakatime](https://wakatime.com/badge/github/uwu/shelter.svg)](https://wakatime.com/badge/github/uwu/shelter)

## What is shelter?

shelter is a new generation client mod built to be essentially bulletproof.

Its development was sparked by the death of many client mods and the blow
to all others that was Discord's switch to SWC.

You can read much more about this event [here](https://web.archive.org/web/20230726025103/https://cumcord.com/an-exercise-in-futility).

It is developed by ex-members of the old Cumcord Team, under uwu.network.

## What plugins has it got?

Its early days at the moment, but there are a couple.

Check the githubs of uwu members or search for `shelter-plugins`.

## How do I install it?

### Desktop

- Download this repo.
- Find your discord install folder (`%LocalAppData%` for Windows) and go into `resources/` - if theres a file called `app.asar` youre probably in the right place.
- make the folder `resources/app/`
- copy the contents of `shelter/injectors/desktop/app/` into it
- rename `app.asar` to `original.asar`
- fully close and restart discord

#### Kernel

An alternative desktop installation method is [Kernel](https://kernel.fish).
The kernel package is in `injectors/kernel`, if you use this method I expect you to know how to install Kernel yourself.
This is nice because you can run multiple mods at once.

### Firefox

https://addons.mozilla.org/en-GB/firefox/addon/shelter-injector/

### Chromium based browser

- Grab the latest MV2 release from this repo
- Drag and drop the zip file onto the Chromium extensions page.
- Ignore the MV2 error

Also: 
- ~~https://microsoftedge.microsoft.com/addons/detail/shelter-mv3-inj/okemjpeidkmhjpmdcpaibakdhnheblib~~
- ~~https://chrome.google.com/webstore/detail/shelter-mv3-inj/ghdambgjhkmpeaogmikdkaemplkfeaod~~

> [!IMPORTANT]
> Support for Chromium has been dropped.
> 
> The MV3-based injector does not work. Google have tried their absolute best to make an unusably bad
> extensions API and they have succeeded! I have [tried](https://github.com/uwu/shelter/commit/524f4af)
> over and over again to make this work and I officially give the hell up.
> Use the MV2 injection and deal with chrome being angy, and if they indeed remove MV2 support,
> as they claim they will in June 2024, then just [get a better browser](https://lnk.yellows.ink/502816#:~:text=retains%20WebRequest%20blocking).

## How do I make a plugin?

See [the docs](packages/shelter-docs/README.md)

Also see [Lune's docs](https://github.com/uwu/shelter/tree/main/packages/lune#readme)

## Is there a plugin repo / website / etc.?

Possibly not.

This is a somewhat smaller project right now than Cumcord was at the time of its death.

We are working on improving the ecosystem slowly but surely, much is in the works.

Keep an eye on the uwu gh org or [our Discord server](https://discord.gg/FhHQQrVs7U)
to see what we _are_ working on, inside and outside of the client modding space. :)
