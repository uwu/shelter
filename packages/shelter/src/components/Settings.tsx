import { Component, createSignal } from "solid-js";
import { Divider, Switch, Text } from "shelter-ui";
import { isLogging, setLoggingState } from "../dispatchLogger";
import ShelterLogo from "shelter-assets/banner/banner.png";

// TODO: Not style tags, and cleanup

export const Settings: Component = (props) => {
  const [logState, setLogState] = createSignal(isLogging);

  return (
    <>
      <div
        style={{
          display: "flex",
          "flex-direction": "row",
          gap: "0.5rem",
          "align-items": "center",
        }}
      >
        <img style={{ display: "inline", "border-radius": "0.725rem" }} src={ShelterLogo} width={225} height={80.5} />
        {/* TODO: awful */}
        <Text>
          <span
            style={{
              "font-style": "oblique",
              "font-size": "x-large",
            }}
          >
            - an attempt to prepare for the worst
          </span>
        </Text>
      </div>
      <Divider mt mb />
      <div style={{ display: "flex", "flex-direction": "column", gap: "0.5rem", "padding": "0.25rem" }}> {/* until sink adds margin options to divider */}
        <div style={{ display: "flex", "flex-direction": "row", "align-items": "center" }}>
          <Text>Log FluxDispatcher events to the console</Text>
          <span style={{ "margin-left": "auto" }}>
            <Switch
              checked={logState()}
              onChange={(newState) => {
                setLogState(newState);
                setLoggingState(newState);
              }}
            />
          </span>
        </div>
      </div>
    </>
  );
};
