import ShelterKawaiiSvg from "shelter-assets/svg/banner-kawaii.svg";
import ShelterSvg from "shelter-assets/svg/banner.svg";
import { injectCss, LinkButton } from "@uwu/shelter-ui";
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
            <LinkButton href="https://shelter.uwu.network/">Documentation</LinkButton>
            <LinkButton href="https://github.com/uwu/shelter/">GitHub Repository</LinkButton>
          </div>
        </div>
        <DevUi />
        <Plugins />
      </div>
    </>
  );
};
