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

It will install shelter using an injection method called [sheltupdate](https://github.com/uwu/sheltupdate).
This works on all platforms and channels, does not require root access, and should never break due to a discord update.

![Screenshot of the shelter installer](https://i.uwu.network/61318cfbc.png)

If you previously installed shelter on desktop, you will have the legacy injector installed,
and the installer will remove it for you as part of the update process, if it is able to.

In the very unlikely event that you encounter issues with Discord (e.g. not starting) after using the installer,
you may have to do a manual installation instead, please see [this page](/guides/injection) for more info.

If the installer is unable to remove your existing legacy injector installation,
it may ask you to do a manual uninstall. The instructions for this are [below](#manual-legacy-uninstall).

### Configuring Branches

sheltupdate supports multiple "branches", which are mods and tweaks that are injected into Discord. These are currently:

| Branch Name            | Description                                                                                                                                 |
|------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `shelter`              | Injects shelter                                                                                                                             |
| `vencord`              | Injects [Vencord](https://github.com/vendicated/vencord)<br>⚠️ Not an officially supported Vencord installation method                      |
| `equicord`              | Injects [Equicord](https://github.com/equicord/equicord)<br>⚠️ Not an officially supported Equicord installation method                      |
| `betterdiscord`        | Injects [BetterDiscord](https://github.com/betterdiscord/betterdiscord)<br>⚠️ Not an officially supported BetterDiscord installation method |
| `moonlight`            | Injects [Moonlight](https://github.com/moonlight-mod/moonlight)<br>⚠️ Not an officially supported Moonlight installation method             |
| `reactdevtools`        | Adds the [React Developer Tools](https://github.com/facebook/react/tree/main/packages/react-devtools)                                       |
| `spotify_embed_volume` | Adds a volume slider to Spotify embeds                                                                                                      |
| `yt_ad_block`          | Blocks ads in YouTube embeds                                                                                                                |
| `yt_embed_fix`         | Makes more YouTube videos viewable from within Discord                                                                                      |
| `native_titlebar`      | Replaces Discord's custom titlebar with Windows' native one                                                                                 |

After installing shelter via the installer you will see a section called `Client Mods` in your Discord settings.
There, you can configure additional branches that should be loaded alongside shelter. In order for them to apply, you will need to restart Discord fully.

#### Using branches but without shelter

If you want to, you can also make use of the branches without having to run shelter as well. But this requires you to configure your branches manually.

This is because the `Client Mods` section in the settings depends on shelter.

To configure your branches manually, you need to find your `settings.json` file,
and modify the `UPDATE_ENDPOINT` and `NEW_UPDATE_ENDPOINT` keys:

| OS              | Path                                                             |
|-----------------|------------------------------------------------------------------|
| Windows         | `%AppData%\discord\settings.json`                                |
| macOS           | `~/Library/Application Support/discord/settings.json`            |
| Linux           | `~/.config/discord/settings.json`                                |
| Linux (Flatpak) | `~/.var/app/com.discordapp.Discord/config/discord/settings.json` |

On a fresh install it should look like this:

```json
"UPDATE_ENDPOINT": "https://inject.shelter.uwu.network/shelter",
"NEW_UPDATE_ENDPOINT": "https://inject.shelter.uwu.network/shelter/",
```

Replace `shelter` with the combination of branches that you want.

You can install multiple branches by concatenating them with `+`s,
like: `shelter+vencord`, `moonlight+yt_ad_block+spotify_embed_volume`.

::: warning
Ensure you leave a `/` at the end of the new endpoint, and do not put one on the old endpoint.
:::

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
