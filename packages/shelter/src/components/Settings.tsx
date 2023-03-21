import { injectCss, Header, HeaderTags, Divider } from "shelter-ui";
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
      <Header tag={HeaderTags.H1} class={`${classes.row} ${classes.slogan}`}>
        <ShelterLogo />- an attempt to prepare for the worst
      </Header>

      <Divider mt mb />

      <div class={classes.column} style={{ padding: "0.25rem" }}>
        <DevUi />

        <Plugins />
      </div>
    </>
  );
};
