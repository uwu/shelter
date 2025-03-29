import { Component, JSX } from "solid-js";

type Icon = Component<JSX.SvgSVGAttributes<SVGSVGElement>>;

export const ChevronIcon: Icon = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
  </svg>
);

export const DevIcon: Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="m15.5 3.9c-.2-.2-.6-.2-.9 0l-.8.8c-.2.2-.2.6 0 .8l6 6.1c.2.2.2.6 0 .8l-6 6.1c-.2.2-.2.6 0 .8l.8.8c.2.2.6.2.9 0l7.6-7.7c.2-.2.2-.6 0-.8l-7.6-7.7zm-5.4 1.6c.2-.2.2-.6 0-.8l-.8-.8c-.2-.2-.6-.2-.9 0l-7.6 7.7c-.2.2-.2.6 0 .8l7.6 7.7c.2.2.6.2.9 0l.8-.8c.2-.2.2-.6 0-.8l-6-6.1c-.2-.2-.2-.6 0-.8l6-6.1z"
    ></path>
  </svg>
);

export const LocalIcon: Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M12 11.55C9.64 9.35 6.48 8 3 8v11c3.48 0 6.64 1.35 9 3.55c2.36-2.19 5.52-3.55 9-3.55V8c-3.48 0-6.64 1.35-9 3.55M12 8c1.66 0 3-1.34 3-3s-1.34-3-3-3s-3 1.34-3 3s1.34 3 3 3"
    ></path>
  </svg>
);

export const SyncIcon: Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6c0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8m0 14c-3.31 0-6-2.69-6-6c0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4l-4-4z"
    ></path>
  </svg>
);
