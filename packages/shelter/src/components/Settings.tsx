import { Component } from "solid-js";
import { Divider, Text } from "shelter-ui";
import ShelterLogo from "shelter-assets/banner/banner.png";

// TODO: Not style tags

export const Settings: Component = (props) => (
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
    <Divider />
  </>
);
