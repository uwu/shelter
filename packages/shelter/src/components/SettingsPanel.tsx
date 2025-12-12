import { Component, JSX, Show, createSignal } from "solid-js";
import { Header, HeaderTags, injectCss, type IconComponent, Text, TextTags, TextWeights } from "@uwu/shelter-ui";
import { classes, css } from "./SettingsPanel.tsx.scss";

let injectedCss = false;

type SettingsPanelProps = {
  title: string;
  icon: Component<JSX.SvgSVGAttributes<SVGSVGElement>>;
  children: JSX.Element;
  defaultOpen?: boolean;
  description?: string;
};

export const SettingsPanel = (props: SettingsPanelProps) => {
  if (!injectedCss) {
    injectedCss = true;
    injectCss(css);
  }

  const [isOpen, setIsOpen] = createSignal(props.defaultOpen ?? false);

  return (
    <div class={`${classes.container} ${isOpen() ? classes.containeropened : ""}`}>
      <div
        class={classes.header}
        onClick={() => setIsOpen(!isOpen())}
        aria-expanded={isOpen()}
        role="button"
        tabindex="0"
      >
        <div class={classes.icon}>{() => <props.icon />}</div>
        <div class={classes.title}>
          <Header margin={false} tag={HeaderTags.H5} style="cursor: pointer">
            {props.title}
          </Header>
          <Text
            tag={TextTags.textSM}
            weight={TextWeights.medium}
            style={{
              color: "var(--interactive-text-default)",
            }}
          >
            {props.description}
          </Text>
        </div>

        <div class={classes.caret}>
          <CaretIcon style={{ transform: isOpen() ? "rotate(180deg)" : "rotate(0deg)" }} />
        </div>
      </div>

      <div class={`${classes.section} ${isOpen() ? classes.sectionopened : ""}`}>{props.children}</div>
    </div>
  );
};

const CaretIcon: IconComponent = (props) => (
  <svg
    aria-hidden="true"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M5.3 9.3a1 1 0 0 1 1.4 0l5.3 5.29 5.3-5.3a1 1 0 1 1 1.4 1.42l-6 6a1 1 0 0 1-1.4 0l-6-6a1 1 0 0 1 0-1.42Z"
      class=""
    ></path>
  </svg>
);
