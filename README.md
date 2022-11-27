![shelter](https://github.com/uwu/shelter/raw/main/packages/shelter-assets/banner/banner.png)

_an attempt to prepare for the worst_

[![wakatime](https://wakatime.com/badge/github/uwu/shelter.svg)](https://wakatime.com/badge/github/uwu/shelter)

## What is shelter?

shelter is a new generation client mod built to be essentially bulletproof.

Its development was sparked by the death of many client mods and the blow
to all others that was Discord's switch to SWC.

You can read much more about this event [here](https://cumcord.com/an-exercise-in-futility).

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
- fully close and restart discord

### Firefox

https://addons.mozilla.org/en-GB/firefox/addon/shelter-injector/

### Chromium based browser

- download this repo
- copy the `injectors/webext` folder to somewhere safe
- go to extensions and enable developer mode
- click load unpacked and choose the folder in its safe place
- ignore the mv2 error (see chrome.md one ive written it)

## How do I make a plugin?

See [DOCS.md](DOCS.md)

## Is there a plugin repo / website / build tool / etc.?

No.

This is a much smaller project than Cumcord.
We are generally through with client modding by now and this is developed for
just a few reasons:

- To prove the concept
- To make a minimum viable mod that we will _almost never_ need to maintain
- Because solving problems is neat.

Do not expect the fairly large, seamless ecosystem that Cumcord had.
shelter will be small and no-nonsense.

That said, keep an eye on the uwu gh org or our Discord server
to see what we _are_ working on, outside of the client modding space.
