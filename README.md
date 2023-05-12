![shelter](https://github.com/uwu/shelter/raw/main/packages/shelter-assets/banner/banner.png)

_An attempt to prepare for the worst._

[![wakatime](https://wakatime.com/badge/github/uwu/shelter.svg)](https://wakatime.com/badge/github/uwu/shelter)

## What is shelter?

shelter is a new-generation client mod built to essentially be bulletproof.

Its development was sparked by the death of many client mods and the blow
to all others that was Discord's switch to SWC.

You can read much more about this event [here](https://cumcord.com/an-exercise-in-futility).

It is developed by ex-members of the old Cumcord Team, under uwu.network.

## What plugins does it have?

It is in early stages at the moment, but there are a couple.

Check the GitHub profiles of uwu members or search for `shelter-plugins`.

## How do I install it?

### Desktop

- Download this repo.
- Find your discord install folder (`%localappdata%` for Windows) and go into `resources` - if there is a file called `app.asar`, you are probably in the right place.
- Make the folder `resources/app`.
- Copy the contents of `shelter/injectors/desktop/app` into it.
- Rename `app.asar` to `original.asar`.
- Fully close and restart Discord.

### Firefox

https://addons.mozilla.org/en-GB/firefox/addon/shelter-injector

### Microsoft Edge

https://microsoftedge.microsoft.com/addons/detail/shelter-mv3-inj/okemjpeidkmhjpmdcpaibakdhnheblib

### Chromium-based browser

- Grab the latest MV2 release from this repo.
- Drag and drop the `.zip` file into the Chromium extensions page.
- Ignore the MV2 error (see `CHROME.md` for more details).

You can do the same with the MV3 release.
This will not throw an error about MV2, however, there are a couple of caveats - more jank and less thorough CSP removal.

## How do I make a plugin?

See the [docs](packages/shelter-docs/README.md).

Also see [Lune's docs](https://github.com/uwu/shelter/tree/main/packages/lune#readme).

## Is there a plugin repo / website / build tool / etc.?

Probably not.

This is a much smaller project right now than Cumcord was at the time of its death.

Please do not expect a huge ecosystem, but we do want to have a comfortable dev and user experience.

Keep an eye on this organization or our [Discord server](https://discord.gg/FhHQQrVs7U)
to see what we _are_ working on, inside and outside of the client modding space. :)
