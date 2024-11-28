<script setup>
  import Pill from "./components/Pill.vue";
</script>

# Install shelter

There are multiple ways to install shelter, depending on which platform you are installing on.

Click the links in the sidebar to skip to the relevant section.

---

Watch this space! We are currently working on an improved desktop injection method that will:
 - be host-update resistant on all platforms (currently not supported on non-Arch Linuxes and macOS),
 - be simpler,
 - not require root access on Linux,
 - allow for running alongside other mods, such as Vencord.

Once this is complete, it will be added into the installer, which should streamline the process.

## Desktop

There are multiple ways to install shelter on desktop. We will try to guide you to the best one for you.

If you are using [Kernel](https://kernel.fish), follow these instructions:
::: details Kernel installation
We will not cover how to install Kernel itself. We expect you to know how Kernel works if you are using it.

Install the kernel package from [here](https://github.com/uwu/shelter/tree/main/injectors/kernel).
:::

If you are using Arch Linux, follow these instructions:
::: details Arch Linux installation
Install the [`shelter` AUR package](https://aur.archlinux.org/packages/shelter).
This method is resistant to being overwritten during updates.
:::

Otherwise, [download the shelter installer](https://github.com/uwu/shelter-installer/releases/latest),
and run that.
This method is resistant to being overwritten during updates on Windows, but not on macOS or Linux.

You will need to run the installer as root if you are on Linux, which will not be possible for users on Wayland,
so those users may need to follow the manual installation process, instead.

If you encounter issues with Discord (e.g. not starting) after using the installer,
you may have to do a manual installation instead.

::: details Manual Installation

If you cannot use the shelter installer for any reason, here are the steps to do exactly what it does, yourself.

The end result will be identical to that of running the installer, but you have to work for it.

1. Download the shelter repository [here](https://github.com/uwu/shelter/archive/refs/heads/main.zip)
2. Locate your Discord `resources` folder.
   - On Windows, `%LocalAppData%/discord/resources`
   - On Linux, locations include `/opt/discord/resources` and `/usr/share/discord/resources`
   - On macOS, `/Applications/Discord.app/Contents/resources`
3. From the shelter repo, copy the `injectors/desktop/app` folder into `resources/`
4. Close Discord if it is running, and rename `app.asar` to `original.asar`
   The folder should look something like this when you are done:
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
   - You may like to take this opportunity to replace the stock asar with [OpenAsar](https://openasar.dev).

:::

## Chromium Browsers

Do not follow these instructions if you are using Microsoft Edge, [follow this instead](#microsoft-edge).

As these extensions fetch the latest build of shelter, it is not allowed on the Chrome Webstore (we got kicked off!),
and as there is no easy way to comply with this, you will have to manually install the extension.

1. Download the latest version of the extension [here](https://github.com/uwu/shelter/releases?q=mv3&expanded=true)
2. Unpack the zip to a folder somewhere safe. If you delete this folder, the extension will be uninstalled.
3. Head to [chrome://extensions](chrome://extensions), and enable Developer Mode in the top-right corner
4. Click "Load Unpacked Extension", and select the folder you unpacked the zip into

## Microsoft Edge

Install this extension:
https://microsoftedge.microsoft.com/addons/detail/shelter-mv3-inj/okemjpeidkmhjpmdcpaibakdhnheblib

## Firefox

Install this extension: https://addons.mozilla.org/firefox/addon/shelter-injector/