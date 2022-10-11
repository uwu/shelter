import { createSignal } from "solid-js";
import { Divider, Switch, Text, injectCss } from "shelter-ui";
import { isLogging, setLoggingState } from "../dispatchLogger";
import { classes, css } from "./Settings.tsx.scss";
import ShelterLogo from "./ShelterLogo";

let injectedCss = false;

export default () => {
  if (!injectedCss) {
    injectCss(css);
    injectedCss = true;
  }

  const [logSwitcState, setLogSwitchState] = createSignal(isLogging);

  return (
    <>
      <div class={classes.row}>
        <ShelterLogo />
        <Text>
          <span class={classes.slogan}>- an attempt to prepare for the worst</span>
        </Text>
      </div>
      <Divider mt mb />
      <div class={classes.column} style={{ padding: "0.25rem" }}>
        {/* TODO: SwitchItem */}
        <div class={classes.row}>
          <Text>Log FluxDispatcher events to the console</Text>
          <span style={{ "margin-left": "auto" }}>
            <Switch
              checked={logSwitcState()}
              onChange={(newState) => {
                setLogSwitchState(newState);
                setLoggingState(newState);
              }}
            />
          </span>
        </div>
      </div>
    </>
  );
};
