# How shelter Injection Works

This page explains *how* shelter injection methods work.

The requirements to successfully inject shelter are simply that you run it in the web context AS SOON AS POSSIBLE -
before any of Discord's code loads, and that you remove the Content Security Policy from the page.
This is necessary to ensure we can find all flux stores and react.

## Desktop: sheltupdate

sheltupdate is the current main injection mechanism for shelter. It works by proxying Discord's module update servers.

When Discord asks for the module version registry, we tell it that there's a new version of `discord_desktop_core`
(versus stock, if its already installed it won't need to redownload), and then serve it a patched version that has the
shelter injector code put into it.

You install sheltupdate by editing your `settings.json` file as so:
```json
{
  "IS_MAXIMIZED": true,
  "IS_MINIMIZED": false,
  "MIN_HEIGHT": 500,
  "MIN_WIDTH": 940,
  "UPDATE_ENDPOINT": "https://inject.shelter.uwu.network/shelter",
  "NEW_UPDATE_ENDPOINT": "https://inject.shelter.uwu.network/shelter/"
}
```

and uninstall it by just removing those lines.

You can choose between many branches, e.g. `/shelter`, `/vencord+reactdevtools`, any combo
of the branches listed in the [sheltupdate readme](https://github.com/uwu/sheltupdate) will work.

Note that this introduces a dependency on a server, https://inject.shelter.uwu.network, but you can self host, and we
do endeavour to keep the uptime and reliability of this service as good as we can possibly manage.
If this server is down, your app may not open.

The paths of these settings.json files are:

| OS              | Path                                                             |
|-----------------|------------------------------------------------------------------|
| Windows         | `%AppData%\discord\settings.json`                                |
| macOS           | `~/Library/Application Support/discord/settings.json`            |
| Linux           | `~/.config/discord/settings.json`                                |
| Linux (Flatpak) | `~/.var/app/com.discordapp.Discord/config/discord/settings.json` |

The `index.js` and `preload.js` files patched into `discord_desktop_core` are reused from those in the
traditional installer, but with a few tweaks:
 - preload injection is handled by sheltupdate for you (but using exactly the same mechanism)
 - chainloading is handled by sheltupdate for you (and uses a different mechanism)
   * don't bother chainloading in preload, as sheltupdate also does that for you (using the same mechanism)
 - you are running AFTER `app.whenReady()`, which is fine for shelter but not some other mods
 - you need not bother with host update resistance

## Desktop: traditional

The traditional injection method works by manually replacing the `app.asar` file that is the electron entrypoint for
the application.

This method of injection is a real classic of client mods, and works well, but has many drawbacks:
 - Impossible to resist host updates on macOS
 - Resisting host updates on Windows is complex and often unreliable
 - Resisting host updates on Linux is possible only via package management hooks
 - Requires root access on Linux, or "application management" permissions on macOS
 - Installs system-wide on Linux or macOS instead of being user-specific.
   * Note that unlike many other mods, shelter did not rely on user-specific files for this injection,
     whereas mods like vencord, kernel, etc. would straight up break discord for other users. That's fun.
     shelter just made it so that all users would have shelter.

Instead of a `resources` directory that looks like this:

```
🗁 resources
├── 🗋 app.asar
├── 🗁 bootstrap
└── 🗋 build_info.json
```

it looks like this:
```
🗁 resources
├── 🗁 app
│    ├── 🗋 index.js
│    ├── 🗋 preload.js
│    └── 🗋 package.json
├── 🗁 bootstrap
├── 🗋 build_info.json
└── 🗋 original.asar
```

where `index.js` will run first, inject `preload.js`, and then chainload `original.asar`.

The paths of these resources folders are:

| OS              | Path                                                                                       |
|-----------------|--------------------------------------------------------------------------------------------|
| Windows         | `%LocalAppData%\discord\resources`                                                         |
| macOS           | `/Applications/Discord.app/Contents/Resources`                                             |
| Linux           | `/opt/discord/resources`                                                                   |
| Linux           | `/usr/share/discord/resources`                                                             |
| Linux           | `/usr/lib/discord/resources`                                                               |
| Linux (Flatpak) | `/var/lib/flatpak/app/com.discordapp.Discord/x86_64/stable/active/files/discord/resources` |

The steps followed for the `index.js` generally look like this:
 - Either fetch shelter from the network, or from disk
 - Setup an electron IPC endpoint to make it available to preload
 - Remove content security policy
 - Make sure no other client mods can come along later and mess with that patch
 - If we're running on Windows, and we care enough, put complicated patches in place to attempt to
   persist ourselves after a host update
 - (optional) force devtools on, because that's probably more useful to our users than not
 - Modify `electron.BrowserWindow` using CommonJS bullshit hacks to get Discord's preload, and then replace it with ours
 - Setup an electron IPC endpoint to send Discord's stock preload to our custom preload
 - Find and chainload `../original.asar`

Then this `preload.js` we injected needs to:
 - Use IPC to ask the node side for the shelter JS, and then execute that in the webFrame
 - Use IPC to ask the node side for the original Discord preload, then chainload it.

## Desktop: `alpm-hooks`

On Linux, some package managers support scripts that run upon certain operations.

We have a set of scripts that can install, uninstall, etc. shelter automatically, and provide hooks for Arch Linux's
pacman to automatically reinject shelter after a host update.

These inject the traditional installer automatically, to provide host update resistance.

They are provided by [the `shelter` AUR package](https://aur.archlinux.org/packages/shelter).

## Desktop: Kernel

[Kernel](https://kernel.fish) is a generic electron mod.

Once setup, you can install the [shelter loader package](https://github.com/uwu/shelter/tree/main/injectors/kernel),
which works almost identically to the traditional installer,
but kernel manages loading our preload and chainloading the original preload for us.

## Browser: MV2

On the browser, we can inject shelter from a content script.

We store shelter in extension storage, and at page load, grab it out of extension storage and run it.

Then, we fetch shelter, and if its different, store it and reload.
This usually happens very quickly and isn't noticeable, but is necessary as if we fetch then run, we're too late.

Finally, we use a background script to remove CSP.

## Browser: MV3

This works similarly but subtly differently to the MV2 injector.

First, we use declarative net request to remove CSP as necessary.

Then, we use a content script to inject a script tag to the page that does the actual injection.

That then uses localStorage pretty much identically to the MV2 content script.