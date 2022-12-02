# Google, Chrome, and Chromium.

_-- A complaint by Yellowsink._
(and why injecting shelter on Chrome is harder than Firefox).

shelter necessarily requires a few things from the injector that cannot be
done from inside of shelter itself.

These are:

- injecting it very early
- removing security where necessary

In Manifest V2 WebExtensions and in Electron, this is doable.

Google, however, decided that MV2 is no longer an acceptable format for extensions,
despite there being nothing really that wrong with it.

So they proposed Manifest V3. This new standard is a massive blow to the freedom an
functionality of many web extensions - worryingly ad blockers are a big category,
I wonder why Google would possibly make ad blockers difficult...

shelter has an injector for Manifest V3 browsers, courtesy of work done by Phorcys
to get Cumcord to inject without MV2.

---

This extension has some caveats:

- Necessarily displays a "debugging this page" popup for a while on load
- Can only remove CSP restrictions for `fetch()` requests: no css `@import` or `<script src="...">`
  - If a themer is ever made then this will be a big problem
  - There are possible fixes for this, may be investigated down the line.

---

The Google's greed argument goes further than just ad blockers, though.

You may notice that the extension is not (at the time of writing)
on the Chrome Webstore.

Microsoft and Mozilla both allowed me to upload an extension for
free and have it reviewed.

Google decided first that I was not allowed to be a developer due
to my age (????). But even if someone else had published for me,
they also want a $5 fee before you can even start.

So for now, you can load the mv2 or mv3 extension manually.
See README.md for instructions
