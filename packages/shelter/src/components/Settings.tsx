import ShelterKawaiiSvg from "shelter-assets/svg/banner-kawaii.svg";
import ShelterSvg from "shelter-assets/svg/banner.svg";
import { injectCss, Button, ButtonColors } from "@uwu/shelter-ui";
import { classes, css } from "./Settings.tsx.scss";
import { createSignal } from "solid-js";
import { dbStore } from "../storage";
import Plugins from "./Plugins";
import DevUi from "./DevUI";
import { LocalDataManagement } from "./DataManagement";
import { SettingsPanel } from "./SettingsPanel";
import { SyncMangement } from "./SyncManagement";
import { LocalIcon, DevIcon, SyncIcon } from "./Icons";

let injectedCss = false;

export default () => {
  if (!injectedCss) {
    injectCss(css);
    injectedCss = true;
  }

  dbStore.kawaiiBanner ??= false;
  const [clicks, setClicks] = createSignal(0);

  return (
    <>
      <div class={classes.wrapper}>
        <div class={classes.header}>
          <img
            class={classes.banner}
            onClick={() => {
              if (clicks() < 5) {
                setClicks(clicks() + 1);
              } else {
                setClicks(0);
                dbStore.kawaiiBanner = !dbStore.kawaiiBanner;
              }
            }}
            src={dbStore.kawaiiBanner ? ShelterKawaiiSvg : ShelterSvg}
            draggable={false}
          />
          <div class={classes.linkwrapper}>
            <Button
              color={ButtonColors.SECONDARY}
              onClick={() => window.open("https://shelter.uwu.network/", "_blank")}
            >
              Documentation
            </Button>
            <Button
              color={ButtonColors.SECONDARY}
              onClick={() => window.open("https://github.com/uwu/shelter/", "_blank")}
            >
              GitHub Repository
            </Button>
          </div>
        </div>
        <div>
          <SettingsPanel
            title="Local Data"
            icon={LocalIcon}
            description="Manage your local client data, including backups and data reset options."
          >
            <LocalDataManagement />
          </SettingsPanel>
          <SettingsPanel
            title="Shelter Sync"
            icon={SyncIcon}
            description="Configure Shelter Sync to backup and sync your settings across devices."
          >
            <SyncMangement />
          </SettingsPanel>
          <SettingsPanel
            title="Developer Tools"
            icon={DevIcon}
            description="Only for plugin developers developing using Lune."
          >
            <DevUi fullVersion />
          </SettingsPanel>
        </div>
        <Plugins />
      </div>
    </>
  );
};
