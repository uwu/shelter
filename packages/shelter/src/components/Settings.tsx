import { Divider, injectCss, Header, HeaderTags, SwitchItem } from "shelter-ui";
import { isLogging, setLoggingState } from "../dispatchLogger";
import { classes, css } from "./Settings.tsx.scss";
import ShelterLogo from "./ShelterLogo";

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
        <SwitchItem hideBorder value={isLogging()} onChange={setLoggingState}>
          Log FluxDispatcher events to the console
        </SwitchItem>
      </div>
    </>
  );
};
