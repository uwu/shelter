import ShelterKawaiiSvg from "shelter-assets/svg/banner-kawaii.svg";
import ShelterSvg from "shelter-assets/svg/banner.svg";
import { injectCss, Button, ButtonColors } from "@uwu/shelter-ui";
import { classes, css } from "./Settings.tsx.scss";
import { createSignal } from "solid-js";
import { dbStore } from "../storage";
import Plugins from "./Plugins";
import DevUi from "./DevUI";

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
        <DevUi />
        <Plugins />
      </div>
    </>
  );
};
