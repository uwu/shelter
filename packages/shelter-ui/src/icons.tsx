import { Component, JSX } from "solid-js";

type IconProps = {
  // overwritten to exclude plain string
  style?: JSX.CSSProperties;
};

type IconComponent = Component<IconProps & Omit<JSX.SvgSVGAttributes<SVGSVGElement>, keyof IconProps>>;

export const IconClose: Component = (props: JSX.SvgSVGAttributes<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"
    />
  </svg>
);

export const IconAdd: IconComponent = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    {...props}
    style={{
      "margin-bottom": "-4px",
      ...props.style,
    }}
  >
    <path
      fill="currentColor"
      d="M20 11.1111H12.8889V4H11.1111V11.1111H4V12.8889H11.1111V20H12.8889V12.8889H20V11.1111Z"
    />
  </svg>
);

export const IconBin: IconComponent = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    {...props}
    style={{
      "margin-bottom": "-4px",
      ...props.style,
    }}
  >
    <path
      fill="currentColor"
      d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12 1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"
    />
  </svg>
);

export const IconCog: IconComponent = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    {...props}
    style={{
      "margin-bottom": "-4px",
      ...props.style,
    }}
  >
    <path
      fill="currentColor"
      d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
    />
  </svg>
);
