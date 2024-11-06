import { injectCss, Header, HeaderTags } from "@uwu/shelter-ui";
import { classes, css } from "./Settings.tsx.scss";
import ShelterLogo from "./ShelterLogo";
import Plugins from "./Plugins";
import DevUi from "./DevUI";

let injectedCss = false;

export default () => {
  if (!injectedCss) {
    injectCss(css);
    injectedCss = true;
  }

  return (
    <>
      <div class={classes.wrapper}>
        <Header tag={HeaderTags.H1} class={classes.header}>
          <ShelterLogo />- an attempt to prepare for the worst
        </Header>
        <DevUi />
        <Plugins />
      </div>
    </>
  );
};
