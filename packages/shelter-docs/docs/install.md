---
outline: [2, 3]
---

# Install shelter

There are multiple ways to install shelter, depending on which platform you are installing on.

Click the links in the sidebar to skip to the relevant section.

Information on the technical details of injection can be found on [this page](/guides/injection),
but this page will simply include instructions relevant to the end user to get shelter up and running.

## Desktop

::: details I am using [Kernel](https://kernel.fish)
We will not cover how to install Kernel itself. We expect you to know how Kernel works if you are using it.

Install the kernel package from [here](https://github.com/uwu/shelter/tree/main/injectors/kernel).
:::

Assuming you are not using Kernel,
[download the shelter installer](https://github.com/uwu/shelter-installer/releases/latest) and run that.

It will install shelter using an injection method called sheltupdate.
This works on all platforms and channels, does not require root access, and should never break due to a discord update.

![Screenshot of the shelter installer](https://i.uwu.network/61318cfbc.png)

If you previously installed shelter on desktop, you will have the legacy injector installed,
and the installer will remove it for you as part of the update process, if it is able to.

In the very unlikely event that you encounter issues with Discord (e.g. not starting) after using the installer,
you may have to do a manual installation instead, please see [this page](/guides/injection) for more info.

If the installer is unable to remove your existing legacy injector installation,
it may ask you to do a manual uninstall. The instructions for this are [below](#manual-legacy-uninstall).

### Switching Branches

sheltupdate supports multiple "branches", which is the mods that are injected into Discord. These are currently:

| Branch Name     | Description                                                                                           |
|-----------------|-------------------------------------------------------------------------------------------------------|
| `shelter`       | Injects shelter                                                                                       |
| `vencord`       | Injects Vencord; do not expect support from the Vencord authors while using this                      |
| `betterdiscord` | Injects BetterDiscord                                                                                 |
| `reactdevtools` | Adds the [React Developer Tools](https://github.com/facebook/react/tree/main/packages/react-devtools) |

In the future, we plan to add a UI to toggle these on and off, either within the app or installer.
Watch this space for information on that, when it becomes available. For now, you'll need to do it yourself.

You can install multiple branches by concatenating the names with `+`s,
like: `shelter+vencord`, `vencord+shelter+reactdevtools`.

To change these branches, you need to find your `settings.json` file,
and modify the `UPDATE_ENDPOINT` and `NEW_UPDATE_ENDPOINT` keys:

| OS              | Path                                                             |
|-----------------|------------------------------------------------------------------|
| Windows         | `%AppData%\discord\settings.json`                                |
| macOS           | `~/Library/Application Support/discord/settings.json`            |
| Linux           | `~/.config/discord/settings.json`                                |
| Linux (Flatpak) | `~/.var/app/com.discordapp.Discord/config/discord/settings.json` |

You should be able to identify that you are in the right place quite easily, it should look like
```json
"UPDATE_ENDPOINT": "https://inject.shelter.uwu.network/shelter",
"NEW_UPDATE_ENDPOINT": "https://inject.shelter.uwu.network/shelter/"
```

Ensure you leave a `/` on the end of the new endpoint, and do not put one on the old endpoint.

### Manual Legacy Uninstall

If you have been asked by the shelter installer to manually uninstall the traditional/legacy injector, here are the
steps to do that.

First, find your resources folder:

| OS              | Path                                                                                       |
|-----------------|--------------------------------------------------------------------------------------------|
| Windows         | `%LocalAppData%\discord\resources`                                                         |
| macOS           | `/Applications/Discord.app/Contents/Resources`                                             |
| Linux           | `/opt/discord/resources`                                                                   |
| Linux           | `/usr/share/discord/resources`                                                             |
| Linux           | `/usr/lib/discord/resources`                                                               |
| Linux (Flatpak) | `/var/lib/flatpak/app/com.discordapp.Discord/x86_64/stable/active/files/discord/resources` |

It should look like so:

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

Rename `original.asar` to `app.asar`, and delete the `app` folder. It should look like this:

```
🗁 resources
├── 🗋 app.asar
├── 🗁 bootstrap
└── 🗋 build_info.json
```

You're done! Go back to the shelter installer to install sheltupdate, if you were trying to do that.

## Firefox

Install this extension: https://addons.mozilla.org/firefox/addon/shelter-injector/

## Microsoft Edge

Install this extension:
https://microsoftedge.microsoft.com/addons/detail/shelter-mv3-inj/okemjpeidkmhjpmdcpaibakdhnheblib

## Other Chromium Browsers

Do not follow these instructions if you are using Microsoft Edge.

As these extensions fetch the latest build of shelter, it is not allowed on the Chrome Webstore (we got kicked off!),
and as there is no easy way to comply with this, you will have to manually install the extension.

1. Download the latest version of the extension [here](https://github.com/uwu/shelter/releases?q=mv3&expanded=true)
2. Unpack the zip to a folder somewhere safe. If you delete this folder, the extension will be uninstalled.
3. Head to [chrome://extensions](chrome://extensions), and enable Developer Mode in the top-right corner
4. Click "Load Unpacked Extension", and select the folder you unpacked the zip into