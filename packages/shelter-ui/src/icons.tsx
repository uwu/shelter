import { type Component, type JSX } from "solid-js";
import { type NativeExtendingComponent } from "./wrapperTypes";

type IconProps = {
  // overwritten to exclude plain string
  style?: JSX.CSSProperties;
};

type IconComponent = NativeExtendingComponent<IconProps, JSX.SvgSVGAttributes<SVGSVGElement>>;

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

export const IconEdit: IconComponent = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 -960 960 960"
    {...props}
    style={{
      "margin-bottom": "-4px",
      ...props.style,
    }}
  >
    <path
      fill="currentColor"
      d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"
    />
  </svg>
);

export const IconUpdate: IconComponent = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 -960 960 960"
    {...props}
    style={{
      "margin-bottom": "-4px",
      ...props.style,
    }}
  >
    <path
      fill="currentColor"
      d="M240-120v-80l40-40H160q-33 0-56.5-23.5T80-320v-440q0-33 23.5-56.5T160-840h320v80H160v440h640v-120h80v120q0 33-23.5 56.5T800-240H680l40 40v80H240Zm360-240L400-560l56-56 104 103v-327h80v327l104-103 56 56-200 200Z"
    />
  </svg>
);

export const IconUpload: IconComponent = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 -960 960 960"
    {...props}
    style={{
      "margin-bottom": "-4px",
      ...props.style,
    }}
  >
    <path
      fill="currentColor"
      d="M440-200h80v-167l64 64 56-57-160-160-160 160 57 56 63-63v167ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"
    />
  </svg>
);

export const IconInfo: IconComponent = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 -960 960 960"
    {...props}
    style={{
      "margin-bottom": "-4px",
      ...props.style,
    }}
  >
    <path
      fill="currentColor"
      d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
    />
  </svg>
);
