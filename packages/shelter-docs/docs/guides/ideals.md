# shelter ideals

This page goes through some ideals and principles, including those behind shelter and those held by the core developers.
Some of them are applicable to plugin developers, and you would do well to follow those in your plugins.
Many of them are more abstract, or only applicable to shelter itself.

Yes, this is the bit where we get a little pretentious, sorry about that. If you are allergic to people writing lots of
not-particularly-technical words about software and management, then your convenient skip button is [here](background).

## (Non)-reliance on Discord code

shelter is built to minimize use of Discord's internal code.
Most mods are built to use webpack, and regexes on
the actual code, and as such become heavily reliant on the internals of Discord.

The problem is that the internals change. Plugins will not survive if left unmaintained, and a severe change can knock
out an entire ecosystem in a single moment,
[as has happened before](http://web.archive.org/web/20230121083343/https://cumcord.com/an-exercise-in-futility).

shelter focuses on using as little of Discord's code as possible. We use some of it, we kinda have to if writing plugins
is going to be not-horrible, but we are very, very careful about it. We don't do it if we can avoid it.

Which brings us on to...

## Placing bets on stability

The hard reality is that if shelter was taken to the logical conclusion and didn't use any of Discord internal code,
it would be so painful to write plugins for it that it would not be worth it.
That doesn't mean that we can't be smart about it.

When we use a Discord component, we are placing a bet. We are betting that that will not be removed or replaced, and
will continue to work in the way it does now in the future.

We have carefully chosen parts that are very, very unlikely to change. Examples of this include:
 - Using Flux: Discord's entire app is built around Flux. Minutae of the Flux implementation _may_ change
   (`getLocalVars` was removed recently! (early 2024)), but the core principles will almost certainly stay intact,
   that of stores and the dispatcher. It is also highly unlikely we see any major changes to Flux as Meta have given up
   maintaining it, and Discord have better things to do than screw around with their fork of an obsolete state manager.

   Therefore, it is a good bet to bet on Flux.
 - Using React Fiber: React's reconciler has been set in stone for quite a while now, it does not change often. The
   fiber reconciler introduced in React 16 is about as efficient as it is possible to make a React reconciler, so it is
   highly unlikely that Meta put significant effort into swapping it out, especially when they put so much effort into
   async rendering in React 18 that would need to be thrown out if they ditched fibers.

   Therefore, it is a good bet to bet on React Fiber.
 - Superagent/HTTP: Discord use superagent for all their HTTP operations, and it is unlikely that they change this.
   Sure, it is not something they are tied to nearly as hard as Flux or React, but there is no reason for them to switch
   out an HTTP library when it is doing a lot of heavy lifting for them.

   We think this is a reasonable, if not "good" bet, and if it ever changes, we can very easily fix it within shelter
   and all plugins will move on entirely unharmed.

We encourage you not to use webpack in your plugins if you can avoid it.

## Breaking changes

shelter doesn't do breaking changes. This is a logical step given that we are built for stability.
If an API needs updating,
[we make it compatible](https://github.com/uwu/shelter/commit/f893fa06e4a3336e83e42060f5613cc7f11167c6).
If a dependency causes a breaking change,
[we pin it](https://github.com/uwu/shelter/commit/805e3a0450d2154c33ca392dea63fde205f81784).

This means that you can be sure that your plugins, which work today, work tomorrow.

## Openness and hack-ability

shelter has a relatively simple view on how to treat the user.
If you're using a GUI, it should just work:tm: and never have any issues (ideally this holds 100% of the time, but we
do live in the real world!)
If you're touching any code, we assume that you know what you are doing.

If you look at the APIs, you will find internal APIs that let you screw with plugins (well, not everything is exposed,
but most of it!), that let you access internal shelter state, and potentially seriously break things.

But to somebody, somewhere, those APIs will be useful, and might be the difference between a plugin idea being possible
and impossible.

So we let shelter be open and free. We don't want to get into a state where you open the Javascript console and try to
poke around, and you just cannot do anything. This is the fate that has befallen some mods (notably Vencord), and it
sucks!

## Dynamic plugin loading

shelter itself does not work if you dynamically load it after Discord is already running.
In theory, it can be made to work, but at the minute it has to start before Discord's code finishes loading.
shelter can uninject at any time in theory, but really you're likely to leave it running for the full session.

Plugins are different. Users expect to be able to install a plugin from a URL and start using it straight away.
If plugins need to reload the page, as is the case in some mods beginning with "V" we could name, you just get a
miserable experience for the end user.

Your plugins MUST be able to load at any time, and SHOULD unload and clean up after themselves when they are done.

Technically, there is no punishment for failing to clean up after yourself, and in general the design of shelter doesn't
trust plugins to do their cleanup to an extent to not cause any bugs if you don't, but the user will expect to be able
to turn plugins on and off at will, and you should facilitate this.

## Feature Creep

Something that comes naturally to projects is scope creep. As you work on something, you find new problems your project
could solve, and it seems natural to expand the scope of a project to do so.

After all, it seems to make sense for a client mod to have
[themes built in](https://github.com/BetterDiscord/BetterDiscord/blob/d3639d1/renderer/src/modules/thememanager.js),
as most users want that.
Perhaps it should also have
[anti-tracking mods](https://github.com/Vendicated/Vencord/blob/4d8e4e6/src/plugins/_core/noTrack.ts)
and [development tools](https://github.com/powercord-org/powercord/tree/v2/src/Powercord/plugins/pc-sdk)
that some plugin devs may want.
Why not?

Well, consider, this means that individual mods become bloated, with the mod developers shouldering much responsibility
for things outside the core goal of the mod.
It also means that if one of those things breaks, the whole mod needs an update.
Also consider that if a developer thinks they can write a better implementation, it is fundamentally disadvantaged by
the main one always being there anyway, and seeming like a more "janky" solution than the official implementation.

If your theme loader, "essential" plugins, development tools (which many users won't even want!), etc. are all plugins,
then the system you already have in place to keep those up to date can simply update those as needed. Simple.

shelter's general rules of thumb for this are as follows:
 - If it is a utility which other plugins would want to use, and would not make sense to be bundled into each plugin,
   it makes sense to make it an API.
 - Some things have to be woven into the mod deeply in some way.
   Examples include having to run before any plugins start loading or to have access to exfiltration.
   If something must be moved into the mod itself for technical reasons, that is fine.
 - If you find yourself making a utility library in your plugins folder, probably one of the following conditions apply:
   * You're doing it wrong
   * That utility might be nice to have in the mod for all to use!
   * Maybe that should be made into a public library developers can import and use themselves.
 - If you're implementing internal functionality using the plugin system as a convenience, you should reconsider if
   that functionality even belongs inside the mod. Even if it does, is this the best way to go about it? Unlikely!

At the end of the day, mod developer discretion is required to call shots.
With a careful eye on the scope of the project, and an effort to keep things that need it well-defined / standardised,
we can create an environment that reaps all the benefits of an open platform,
and makes sure that each piece of the puzzle does its job, and its job only.

## Maintainer Replace-ability

A lot of the design choices and ideals that show up in shelter previously appeared in
[Cumcord](https://github.com/cumcord). This is mainly because both were made by the same group of people.

Something that was always handled carefully then was that Link, CC's creator, could essentially be replaced at any time.
This may feel like a weird property to try to ensure, but it makes a lot of sense.
Developers are human, not machines, and if a software project with any real user base is to work smoothly,
it is useful that another person can step in and act as a new maintainer temporarily or permanently.
We got good results out of this choice, it certainly wasn't useless.

The ecosystem around shelter is not dissimilar. The source code repositories, project tracking board, npm packages, etc.
are all under the umbrella of uwu.network, so if I (Yellowsink) are to die tomorrow (ideally not, lol), then shelter is
not *necessarily* instantly abandonware.

Real life examples of _failing_ at this include
[Firefish](https://firefish.dev/firefish/firefish/-/releases/v20240206#comments-on-the-transfer-of-the-project-ownership-forge-migration-and-the-future),
in which the domain name was not transferred and a replacement had to be found by the new maintainers,
and [Rome / Biome](https://biomejs.dev/blog/annoucing-biome/), in which moderation of community spaces, access to
website hosting, access to package registries, and the licensing situation of the Rome project were all lost by the new
maintainers, and so they essentially started over as a fork under a new name.

We don't want this to ever happen to shelter, that sucks.
Except for the `uwu.network` domain name itself, it should take most of the collective being separately unavailable
(highly unlikely) for shelter to be impossible to retrieve if wanted.

### Trust (and Plugin Safety)

This leads on very neatly to trust. Who do you trust?

This mostly concerns how we deal with potentially malicious plugins. It should never be required that you depend upon
the mod developer to be able to use plugins.
Situations where this is the case includes cases where plugins are all built into the mod itself (Vencord), and cases
where the *only* way to install plugins is from a developer maintained repository.

That said, you should always be able to trust the mod developers for plugin safety. If code is given to you by a mod
developer, and you trust the mod to be safe, you should also trust the code they hand you with it to be safe.
The logical conclusion of this is that a developer-operated plugin listing should be free of malware, no exceptions.

The solution applied in the past by Cumcord was a manifestation of this approach to trust.
Nobody forced you to rely on CC team to provide you with plugins, but we did provide a vetted, safe selection for you if
you chose to use it.

Ultimately, it should be entirely *possible* for a reasonable person to fully trust in the mod developers to handle
users safely.
However, it should never be *required* for a user to trust us, beyond the implicit trust of using the mod at all.

Now that you've read *far too many* words, you get red pandas, as a treat.
![](https://cdn.hyrule.pics/26f9dc487.webp)