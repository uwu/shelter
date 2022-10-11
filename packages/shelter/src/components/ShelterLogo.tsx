import ShelterPng from "shelter-assets/banner/banner.png";

interface ShelterLogoProps {
  width?: number;
  height?: number;
}

export default (props: ShelterLogoProps) => (
  <img
    style={{ display: "inline", "border-radius": "0.725rem", "user-select": "none" }}
    src={ShelterPng}
    width={props.width || 225}
    height={props.height ?? 80.5}
    draggable={false}
  />
);
