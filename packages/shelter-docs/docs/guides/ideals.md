# shelter ideals

This page goes through some ideals and principles behind shelter.
You would do well to follow them in your plugins.

Yes, this is the bit where we get a little pretentious. Sorry about that.

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