import { Divider, injectCss, Header, HeaderTags, SwitchItem } from "shelter-ui";
import { classes, css } from "./Settings.tsx.scss";
import ShelterLogo from "./ShelterLogo";
import { dbStore } from "../storage";

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
        <SwitchItem hideBorder value={dbStore.logDispatch} onChange={(v) => (dbStore.logDispatch = v)}>
          Log FluxDispatcher events to the console
        </SwitchItem>
      </div>
    </>
  );
};
